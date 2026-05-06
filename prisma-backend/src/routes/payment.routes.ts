import { Router } from 'express';
import { createPayment, createCheckoutSession, stripeWebhook } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN']), createPayment);
router.post('/:id/checkout', authenticate, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
