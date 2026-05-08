import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../infrastructure/guards/auth.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('categories')
  async getCategories() {
    const data = await this.contentService.findAllCategories();
    return { success: true, data };
  }

  @Get('items')
  async getItems(@Query('categoryId') categoryId?: string) {
    const data = await this.contentService.findItemsByCategory(categoryId);
    return { success: true, data };
  }

  @Get('my-progress')
  async getMyProgress(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const data = await this.contentService.getUserProgress(userId);
    return { success: true, data };
  }

  @Get('items/:id')
  async getItemDetails(@Param('id') id: string) {
    const data = await this.contentService.findItem(id);
    return { success: true, data };
  }

  @Post('items/:id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
    @Req() req: any
  ) {
    const userId = req.user.sub || req.user.id;
    const data = await this.contentService.updateReadingProgress(userId, id, body.progress);
    return { success: true, message: 'Progress updated', data };
  }
}
