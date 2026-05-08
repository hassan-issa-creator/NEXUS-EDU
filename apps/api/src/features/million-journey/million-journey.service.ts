import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MillionJourneyService {
  constructor(private prisma: PrismaService) {}

  async getMilestones() {
    return this.prisma.journeyMilestone.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getUserProgress(userId: string) {
    const userMilestones = await this.prisma.userMilestone.findMany({
      where: { userId },
      include: {
        milestone: true,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalXP: true, level: true },
    });

    return {
      totalXP: user?.totalXP || 0,
      level: user?.level || 1,
      unlockedMilestones: userMilestones,
    };
  }

  async checkAndUnlockMilestones(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const milestones = await this.getMilestones();
    const unlocked = await this.prisma.userMilestone.findMany({ where: { userId } });
    const unlockedIds = new Set(unlocked.map(u => u.milestoneId));
    const newlyUnlocked: any[] = [];
    for (const ms of milestones) {
      if (user.totalXP >= ms.xpRequired && !unlockedIds.has(ms.id)) {
        const newUnlock = await this.prisma.userMilestone.create({
          data: {
            userId,
            milestoneId: ms.id,
          }
        });
        newlyUnlocked.push(newUnlock);
      }
    }

    return newlyUnlocked;
  }
}
