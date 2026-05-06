import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma.service';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(private prisma: PrismaService) {
    this.initializeWebPush();
  }

  private initializeWebPush() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail =
      process.env.VAPID_EMAIL || 'mailto:admin@million-platform.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn('VAPID keys not configured. Web Push disabled.');
      this.logger.warn('Generate keys with: npx web-push generate-vapid-keys');
      return;
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    this.logger.log('Web Push service initialized ✅');
  }

  /**
   * Save push subscription for a user
   */
  async saveSubscription(
    userId: string,
    subscription: PushSubscription,
  ): Promise<void> {
    try {
      // In real implementation, save to database
      // For now, we'll use a simple in-memory store or log it
      this.logger.log(`Saved push subscription for user ${userId}`);

      // TODO: Create PushSubscription model in Prisma
      // await this.prisma.pushSubscription.create({
      //   data: {
      //     userId,
      //     endpoint: subscription.endpoint,
      //     p256dh: subscription.keys.p256dh,
      //     auth: subscription.keys.auth,
      //   },
      // });
    } catch (error) {
      this.logger.error('Failed to save subscription:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a user
   */
  async sendPushToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<boolean> {
    try {
      // Get user's subscriptions from database
      // const subscriptions = await this.prisma.pushSubscription.findMany({
      //   where: { userId },
      // });

      // For demo: assume we have a subscription
      const mockSubscription = {
        endpoint: 'mock-endpoint',
        keys: { p256dh: 'mock-key', auth: 'mock-auth' },
      };

      const notificationPayload = JSON.stringify({
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/logo.png',
          badge: payload.badge || '/badge.png',
          data: payload.data,
          actions: payload.actions,
          dir: 'rtl', // RTL support
          lang: 'ar',
        },
      });

      // Send to all user's devices
      await webpush.sendNotification(
        mockSubscription as any,
        notificationPayload,
      );

      this.logger.log(`Push sent to user ${userId}: ${payload.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send to multiple users
   */
  async sendPushToMultipleUsers(
    userIds: string[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const success = await this.sendPushToUser(userId, payload);
      if (success) sent++;
      else failed++;
    }

    return { sent, failed };
  }

  /**
   * Unsubscribe a device
   */
  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    // TODO: Delete from database
    // await this.prisma.pushSubscription.deleteMany({
    //   where: { userId, endpoint },
    // });
    this.logger.log(`Unsubscribed device for user ${userId}`);
  }

  /**
   * Get VAPID public key (for client-side subscription)
   */
  getPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  }
}
