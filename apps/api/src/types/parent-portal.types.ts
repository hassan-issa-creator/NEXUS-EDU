/**
 * Parent Portal Types
 * Type definitions for parent portal system
 */

// ==================== PARENT DASHBOARD TYPES ====================

export interface ParentDashboardSummary {
  studentId: string;
  studentName: string;
  avgGrade: number;
  totalGrades: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  attendanceRate: number;
  totalAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
  positiveBehaviors: number;
  negativeBehaviors: number;
  totalBehaviorPoints: number;
  unreadNotifications: number;
  lastUpdated: Date;
}

export interface ParentNotification {
  id: string;
  parentId: string;
  studentId?: string;
  notificationType: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
}

export interface ParentTeacherMessage {
  id: string;
  parentId: string;
  teacherId: string;
  studentId?: string;
  subject: string;
  messageText: string;
  replyToId?: string;
  attachmentUrls?: string[];
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
  createdAt: Date;
}

export interface StudentBehaviorRecord {
  id: string;
  studentId: string;
  classId?: string;
  recordedBy: string;
  behaviorType: 'positive' | 'negative' | 'neutral';
  category?: string;
  title: string;
  description?: string;
  points: number;
  incidentDate: Date;
  parentNotified: boolean;
  parentNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface GetParentDashboardRequest {
  studentId?: string;
}

export interface ParentDashboardResponse {
  children: {
    studentId: string;
    studentName: string;
    avgGrade: number;
    attendanceRate: number;
    pendingAssignments: number;
    unreadNotifications: number;
    recentActivity: {
      positivePoints: number;
      negativePoints: number;
      totalPoints: number;
    };
  }[];
}

export interface SendMessageRequest {
  teacherId: string;
  studentId?: string;
  subject: string;
  messageText: string;
  replyToId?: string;
}

export interface CreateBehaviorRecordRequest {
  studentId: string;
  classId?: string;
  behaviorType: 'positive' | 'negative' | 'neutral';
  category?: string;
  title: string;
  description?: string;
  points?: number;
  incidentDate: Date;
}

export interface GetStudentDetailsResponse {
  student: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    classId: string;
    className: string;
  };
  academics: {
    avgGrade: number;
    subjects: {
      name: string;
      grade: number;
      trend: 'up' | 'down' | 'stable';
    }[];
  };
  attendance: {
    rate: number;
    present: number;
    absent: number;
    late: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  assignments: {
    total: number;
    submitted: number;
    pending: number;
    overdue: number;
  };
  behavior: {
    positiveCount: number;
    negativeCount: number;
    totalPoints: number;
    recentRecords: StudentBehaviorRecord[];
  };
}

// ==================== ERROR TYPES ====================

export class ParentPortalError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ParentPortalError';
  }
}

export const ParentPortalErrorCodes = {
  NOT_PARENT: 'NOT_PARENT',
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  NO_ACCESS: 'NO_ACCESS',
  INVALID_RELATIONSHIP: 'INVALID_RELATIONSHIP',
} as const;
