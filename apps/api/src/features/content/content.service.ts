import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.libraryCategory.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async findItemsByCategory(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};
    return this.prisma.libraryItem.findMany({
      where,
      include: {
        category: true,
        subject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findItem(id: string) {
    const item = await this.prisma.libraryItem.findUnique({
      where: { id },
      include: {
        category: true,
        subject: { select: { id: true, name: true } },
      },
    });
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }

  async updateReadingProgress(userId: string, itemId: string, progress: number) {
    // Validate item exists
    await this.findItem(itemId);

    // Upsert progress
    const existing = await this.prisma.readingProgress.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      // Only update if progress is higher
      if (progress > existing.progress) {
        return this.prisma.readingProgress.update({
          where: { id: existing.id },
          data: { progress, lastReadAt: new Date() },
        });
      }
      return this.prisma.readingProgress.update({
        where: { id: existing.id },
        data: { lastReadAt: new Date() },
      });
    }

    return this.prisma.readingProgress.create({
      data: {
        userId,
        itemId,
        progress,
      },
    });
  }

  async getUserProgress(userId: string) {
    return this.prisma.readingProgress.findMany({
      where: { userId },
      include: {
        item: {
          select: { id: true, title: true, type: true, coverUrl: true },
        },
      },
      orderBy: { lastReadAt: 'desc' },
    });
  }
}
