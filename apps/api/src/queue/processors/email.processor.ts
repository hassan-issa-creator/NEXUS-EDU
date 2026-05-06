import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  template: 'welcome' | 'password-reset' | 'notification' | 'report';
  data: Record<string, any>;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    const { to, subject, template, data } = job.data;

    try {
      // TODO: Integrate with actual email service (Nodemailer, SendGrid, etc.)
      // For now, just log the email
      this.logger.log(`Email sent successfully:
        To: ${to}
        Subject: ${subject}
        Template: ${template}
        Data: ${JSON.stringify(data)}
      `);

      // Simulate email sending delay
      await this.delay(1000);

      // In production, you would do something like:
      // await this.emailService.send({ to, subject, template, data });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error; // This will trigger retry
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
