import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
      {
        // @ts-ignore
        apiVersion: '2024-12-18.acacia',
      },
    );
  }

  private async createAuditLog(params: {
    action: string;
    entityId?: string;
    userId?: string;
    schoolId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    if (!('auditLog' in this.prisma) || !this.prisma.auditLog) {
      return;
    }

    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: 'invoice',
        entityId: params.entityId,
        userId: params.userId,
        schoolId: params.schoolId ?? undefined,
        metadata: params.metadata,
      },
    });
  }

  private mapPaymentIntentStatus(
    status: Stripe.PaymentIntent.Status,
  ): InvoiceStatus {
    switch (status) {
      case 'succeeded':
        return InvoiceStatus.PAID;
      case 'requires_action':
      case 'requires_capture':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return InvoiceStatus.REQUIRES_ACTION;
      case 'canceled':
        return InvoiceStatus.FAILED;
      default:
        return InvoiceStatus.PENDING;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async createInvoice(studentId: string, amount: number, description: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, email: true },
    });

    const invoice = await this.prisma.invoice.create({
      data: {
        studentId,
        amount,
        description,
        schoolId: student?.schoolId,
        status: InvoiceStatus.PENDING,
      },
    });

    const intent = await this.createPaymentIntent(amount, invoice.currency, {
      invoiceId: invoice.id,
      studentId,
      schoolId: student?.schoolId ?? '',
    });

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        stripeId: intent.id,
        status: this.mapPaymentIntentStatus(intent.status),
        metadata: {
          stripeStatus: intent.status,
        },
      },
    });

    await this.createAuditLog({
      action: 'payment.invoice_created',
      entityId: updatedInvoice.id,
      userId: studentId,
      schoolId: updatedInvoice.schoolId,
      metadata: {
        amount,
        currency: updatedInvoice.currency,
        stripeId: updatedInvoice.stripeId,
      },
    });

    return {
      invoice: updatedInvoice,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    stripeId?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        stripeId,
        paidAt: status === InvoiceStatus.PAID ? new Date() : undefined,
        metadata: metadata ?? undefined,
      },
    });

    await this.createAuditLog({
      action: 'payment.invoice_status_updated',
      entityId: invoice.id,
      userId: invoice.studentId,
      schoolId: invoice.schoolId,
      metadata: {
        status,
        stripeId,
      },
    });

    return invoice;
  }

  async getStudentInvoices(studentId: string) {
    return this.prisma.invoice.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleStripeWebhook(signature: string | undefined, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) {
      throw new Error('Stripe webhook secret/signature missing');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.requires_action':
      case 'payment_intent.processing':
      case 'payment_intent.created': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.syncInvoiceFromPaymentIntent(paymentIntent);
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  private async syncInvoiceFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const invoiceId =
      paymentIntent.metadata?.invoiceId ||
      (
        await this.prisma.invoice.findFirst({
          where: { stripeId: paymentIntent.id },
          select: { id: true },
        })
      )?.id;

    if (!invoiceId) {
      return null;
    }

    const status = this.mapPaymentIntentStatus(paymentIntent.status);

    return this.updateInvoiceStatus(invoiceId, status, paymentIntent.id, {
      stripeStatus: paymentIntent.status,
      amountReceived: paymentIntent.amount_received,
      lastEventAt: new Date().toISOString(),
    });
  }
}
