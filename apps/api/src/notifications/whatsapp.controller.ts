import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('WhatsApp')
@Controller('webhook/whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  @Post()
  @ApiOperation({ summary: 'Handle incoming WhatsApp messages' })
  async handleIncomingMessage(@Req() req: any, @Body() body: any) {
    // Twilio sends form-urlencoded data usually, but body parser might handle it
    const from = body.From || req.body.From;
    const message = body.Body || req.body.Body;

    this.logger.log(`Received WhatsApp from ${from}: ${message}`);

    // Here we can add logic to auto-reply or chatbot
    // Example: If message == "grade", fetch last grade using user phone number

    return { status: 'success' };
  }
}
