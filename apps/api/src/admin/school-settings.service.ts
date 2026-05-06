import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface SchoolSettings {
  // نظام الدرجات
  gradingSystem: {
    maxScore: number;
    passingScore: number;
    gradeScale: GradeScale[];
  };

  // الحصص
  periodsConfig: {
    periodsPerDay: number;
    periodDuration: number; // بالدقائق
    breakDuration: number;
    startTime: string; // HH:mm
  };

  // سياسة الغياب
  attendancePolicy: {
    maxAbsenceDays: number;
    lateThreshold: number; // بالدقائق
    parentNotification: boolean;
    warningThreshold: number; // نسبة الغياب للتحذير
  };

  // شكل التقارير
  reportSettings: {
    schoolName: string;
    schoolLogo?: string;
    headerText: string;
    footerText: string;
    showRank: boolean;
    showAttendance: boolean;
    showBehavior: boolean;
    language: 'ar' | 'en';
  };
}

export interface GradeScale {
  min: number;
  max: number;
  grade: string;
  gradeAr: string;
  points: number;
}

const DEFAULT_SETTINGS: SchoolSettings = {
  gradingSystem: {
    maxScore: 100,
    passingScore: 50,
    gradeScale: [
      { min: 90, max: 100, grade: 'A+', gradeAr: 'ممتاز', points: 4.0 },
      { min: 85, max: 89, grade: 'A', gradeAr: 'ممتاز مرتفع', points: 3.7 },
      { min: 80, max: 84, grade: 'B+', gradeAr: 'جيد جداً', points: 3.3 },
      { min: 75, max: 79, grade: 'B', gradeAr: 'جيد جداً مرتفع', points: 3.0 },
      { min: 70, max: 74, grade: 'C+', gradeAr: 'جيد', points: 2.7 },
      { min: 65, max: 69, grade: 'C', gradeAr: 'جيد مرتفع', points: 2.3 },
      { min: 60, max: 64, grade: 'D+', gradeAr: 'مقبول', points: 2.0 },
      { min: 50, max: 59, grade: 'D', gradeAr: 'مقبول مرتفع', points: 1.7 },
      { min: 0, max: 49, grade: 'F', gradeAr: 'راسب', points: 0.0 },
    ],
  },
  periodsConfig: {
    periodsPerDay: 7,
    periodDuration: 45,
    breakDuration: 10,
    startTime: '07:30',
  },
  attendancePolicy: {
    maxAbsenceDays: 15,
    lateThreshold: 15,
    parentNotification: true,
    warningThreshold: 20,
  },
  reportSettings: {
    schoolName: 'مدرسة المليون',
    headerText: 'بسم الله الرحمن الرحيم',
    footerText: 'نتمنى لكم التوفيق والنجاح',
    showRank: true,
    showAttendance: true,
    showBehavior: true,
    language: 'ar',
  },
};

@Injectable()
export class SchoolSettingsService {
  private readonly logger = new Logger(SchoolSettingsService.name);
  private settings: SchoolSettings = DEFAULT_SETTINGS;

  constructor(private readonly prisma: PrismaService) {
    this.loadSettings();
  }

  private async loadSettings() {
    // In production, load from database
    // For now, use defaults
    this.logger.log('School settings loaded');
  }

  async getSettings(): Promise<SchoolSettings> {
    return this.settings;
  }

  async updateSettings(
    updates: Partial<SchoolSettings>,
  ): Promise<SchoolSettings> {
    this.settings = {
      ...this.settings,
      ...updates,
      gradingSystem: {
        ...this.settings.gradingSystem,
        ...(updates.gradingSystem || {}),
      },
      periodsConfig: {
        ...this.settings.periodsConfig,
        ...(updates.periodsConfig || {}),
      },
      attendancePolicy: {
        ...this.settings.attendancePolicy,
        ...(updates.attendancePolicy || {}),
      },
      reportSettings: {
        ...this.settings.reportSettings,
        ...(updates.reportSettings || {}),
      },
    };

    this.logger.log('School settings updated');
    return this.settings;
  }

  async updateGradingSystem(
    config: Partial<SchoolSettings['gradingSystem']>,
  ): Promise<SchoolSettings> {
    return this.updateSettings({
      gradingSystem: { ...this.settings.gradingSystem, ...config },
    });
  }

  async updatePeriodsConfig(
    config: Partial<SchoolSettings['periodsConfig']>,
  ): Promise<SchoolSettings> {
    return this.updateSettings({
      periodsConfig: { ...this.settings.periodsConfig, ...config },
    });
  }

  async updateAttendancePolicy(
    config: Partial<SchoolSettings['attendancePolicy']>,
  ): Promise<SchoolSettings> {
    return this.updateSettings({
      attendancePolicy: { ...this.settings.attendancePolicy, ...config },
    });
  }

  async updateReportSettings(
    config: Partial<SchoolSettings['reportSettings']>,
  ): Promise<SchoolSettings> {
    return this.updateSettings({
      reportSettings: { ...this.settings.reportSettings, ...config },
    });
  }

  // Helper methods
  getGradeLetter(score: number): { grade: string; gradeAr: string } {
    const scale = this.settings.gradingSystem.gradeScale.find(
      (g) => score >= g.min && score <= g.max,
    );
    return scale
      ? { grade: scale.grade, gradeAr: scale.gradeAr }
      : { grade: 'N/A', gradeAr: 'غير محدد' };
  }

  isPassing(score: number): boolean {
    return score >= this.settings.gradingSystem.passingScore;
  }

  isLate(minutesLate: number): boolean {
    return minutesLate > this.settings.attendancePolicy.lateThreshold;
  }

  shouldNotifyParent(absenceDays: number): boolean {
    const { maxAbsenceDays, warningThreshold } = this.settings.attendancePolicy;
    const absencePercentage = (absenceDays / maxAbsenceDays) * 100;
    return absencePercentage >= warningThreshold;
  }
}
