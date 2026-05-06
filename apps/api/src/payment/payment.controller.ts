import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Payment Intent' })
  async createIntent(@Body() body: { amount: number; currency?: string }) {
    const intent = await this.paymentService.createPaymentIntent(
      body.amount,
      body.currency,
    );
    return { clientSecret: intent.client_secret, id: intent.id };
  }

  @Post('invoices')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invoice' })
  async createInvoice(
    @Request() req: any,
    @Body() body: { amount: number; description: string },
  ) {
    return this.paymentService.createInvoice(
      req.user.userId,
      body.amount,
      body.description,
    );
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@Request() req: any) {
    return this.paymentService.getStudentInvoices(req.user.userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe payment webhooks' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() req: ExpressRequest & { body: Buffer },
  ) {
    if (!Buffer.isBuffer(req.body)) {
      throw new BadRequestException('Stripe webhook requires raw body');
    }

    return this.paymentService.handleStripeWebhook(signature, req.body);
  }
}
