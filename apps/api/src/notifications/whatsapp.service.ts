import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsAppService {
  private client: Twilio;
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly isEnabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
      this.isEnabled = true;
    } else {
      this.logger.warn(
        'Twilio credentials not found. WhatsApp service disabled.',
      );
      this.isEnabled = false;
    }
  }

  async sendWhatsApp(to: string, body: string, mediaUrl?: string) {
    if (!this.isEnabled) {
      // this.logger.warn(`WhatsApp disabled. Mock sending to ${to}: ${body}`);
      return { success: false, error: 'Service disabled' };
    }

    try {
      const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
      const toWhatsApp = `whatsapp:${to}`;

      const messageOptions: any = {
        from,
        to: toWhatsApp,
        body,
      };

      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }

      const message = await this.client.messages.create(messageOptions);
      this.logger.log(`WhatsApp sent: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Helper for common notifications
  async sendWelcomeMessage(to: string, name: string) {
    return this.sendWhatsApp(
      to,
      `مرحباً ${name}! 👋\nتم تفعيل إشعارات الواتساب بنجاح لمنصة المليون.\nستصلك تقارير وتنبيهات هامة هنا.`,
    );
  }

  async sendGradeNotification(
    to: string,
    studentName: string,
    subject: string,
    grade: number,
  ) {
    return this.sendWhatsApp(
      to,
      `📄 *تنبيه درجة جديدة*\nالطالب: ${studentName}\nالمادة: ${subject}\nالدرجة: ${grade}\n\nتواصل معنا للمزيد من التفاصيل.`,
    );
  }
}
