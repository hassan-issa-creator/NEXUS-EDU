import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { studentId, amount, description } = req.body;

        const payment = await prisma.payment.create({
            data: {
                studentId,
                amount,
                description,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: payment.currency.toLowerCase(),
                        product_data: {
                            name: payment.description || 'School Fee',
                        },
                        unit_amount: Math.round(Number(payment.amount) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payments/${payment.id}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payments/${payment.id}/cancel`,
            client_reference_id: payment.id,
            customer_email: payment.student.email,
        });

        await prisma.payment.update({
            where: { id },
            data: { stripePaymentId: session.id }
        });

        res.json({ checkoutUrl: session.url });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.payment.update({
            where: { stripePaymentId: session.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                transactionId: session.payment_intent as string
            }
        });

        // Send notification
        const payment = await prisma.payment.findUnique({
            where: { stripePaymentId: session.id }
        });

        if (payment) {
            await prisma.notification.create({
                data: {
                    userId: payment.studentId,
                    type: 'PAYMENT',
                    title: 'Payment Successful',
                    message: `Payment of ${payment.amount} ${payment.currency} received`
                }
            });
        }
    }

    res.json({ received: true });
};
