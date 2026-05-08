import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TeacherAutomationService {
  constructor(private prisma: PrismaService) {}

  async getMyRules(teacherId: string) {
    return this.prisma.automationRule.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { logs: true } }
      }
    });
  }

  async createRule(teacherId: string, data: any) {
    return this.prisma.automationRule.create({
      data: {
        teacherId,
        name: data.name,
        triggerType: data.triggerType,
        condition: data.condition,
        actionType: data.actionType,
        actionData: data.actionData,
        isActive: data.isActive ?? true,
      }
    });
  }

  async toggleRule(teacherId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id: ruleId } });
    if (!rule || rule.teacherId !== teacherId) throw new NotFoundException('Rule not found');

    return this.prisma.automationRule.update({
      where: { id: ruleId },
      data: { isActive: !rule.isActive }
    });
  }

  async deleteRule(teacherId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id: ruleId } });
    if (!rule || rule.teacherId !== teacherId) throw new NotFoundException('Rule not found');

    return this.prisma.automationRule.delete({ where: { id: ruleId } });
  }

  async getRuleLogs(teacherId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id: ruleId } });
    if (!rule || rule.teacherId !== teacherId) throw new NotFoundException('Rule not found');

    return this.prisma.automationLog.findMany({
      where: { ruleId },
      orderBy: { executedAt: 'desc' },
      take: 50
    });
  }
}
