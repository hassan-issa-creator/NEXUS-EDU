import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  async getStudentProfile(studentId: string) {
    const profile = await this.prisma.smartStudentProfile.findUnique({
      where: { userId: studentId },
    });

    if (!profile) {
      // Create a default profile if it doesn't exist
      return this.prisma.smartStudentProfile.create({
        data: {
          userId: studentId,
          learningStyle: 'VISUAL',
          strengthSubjects: [],
          weakSubjects: [],
          performanceTrend: 'STABLE',
        },
      });
    }

    return profile;
  }

  async getStudentSkillMasteries(studentId: string) {
    return this.prisma.studentSkillMastery.findMany({
      where: { studentId },
      include: {
        skillNode: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async getSubjectSkillNodes(subjectId: string) {
    return this.prisma.skillNode.findMany({
      where: { subjectId },
    });
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async updateProfilesCron() {
    this.logger.log('Running Smart Student Profile Analysis...');
    // In a real app, we would query the grades and AI feedback to determine the learning style, strengths, etc.
  }
}
