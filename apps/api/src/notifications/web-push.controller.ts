import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  WebPushService,
  PushSubscription,
  PushNotificationPayload,
} from './web-push.service';

@ApiTags('Web Push')
@Controller('api/push')
@ApiBearerAuth()
export class WebPushController {
  constructor(private readonly webPushService: WebPushService) {}

  @Get('public-key')
  @ApiOperation({ summary: 'Get VAPID public key' })
  getPublicKey(): { publicKey: string } {
    return {
      publicKey: this.webPushService.getPublicKey(),
    };
  }

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  async subscribe(
    @Body() data: { userId: string; subscription: PushSubscription },
  ) {
    await this.webPushService.saveSubscription(data.userId, data.subscription);
    return { success: true, message: 'Subscribed successfully' };
  }

  @Post('unsubscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  async unsubscribe(@Body() data: { userId: string; endpoint: string }) {
    await this.webPushService.unsubscribe(data.userId, data.endpoint);
    return { success: true, message: 'Unsubscribed successfully' };
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send push notification (admin/test)' })
  async sendPush(
    @Body() data: { userId: string; payload: PushNotificationPayload },
  ) {
    const sent = await this.webPushService.sendPushToUser(
      data.userId,
      data.payload,
    );
    return { success: sent };
  }
}
