/**
 * QR Attendance Types
 * Type definitions for QR code attendance system
 */

export type QRScanStatus = 'valid' | 'expired' | 'already_used' | 'invalid';

// ==================== QR SESSION TYPES ====================

export interface QRAttendanceSession {
  id: string;
  classId: string;
  subjectId?: string;
  teacherId: string;
  qrCode: string;
  qrSecret: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  maxScans?: number;
  currentScans: number;
  locationLat?: number;
  locationLng?: number;
  locationRadiusMeters?: number;
  title: string;
  description?: string;
  sessionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRAttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  scannedAt: Date;
  scanStatus: QRScanStatus;
  scanLocationLat?: number;
  scanLocationLng?: number;
  isLocationValid?: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isVerified: boolean;
  verifiedBy?: string;
  notes?: string;
  createdAt: Date;
}

export interface QRAttendanceStats {
  sessionId: string;
  classId: string;
  sessionDate: Date;
  totalPresent: number;
  totalEnrolled: number;
  attendanceRate: number;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateQRSessionRequest {
  classId: string;
  subjectId?: string;
  title: string;
  description?: string;
  sessionDate: Date;
  validDurationMinutes?: number; // Default: 30
  maxScans?: number;
  enableGeofencing?: boolean;
  locationLat?: number;
  locationLng?: number;
  locationRadius?: number; // in meters
}

export interface ScanQRRequest {
  qrCode: string;
  locationLat?: number;
  locationLng?: number;
  deviceInfo?: string;
}

export interface VerifyQRResponse {
  isValid: boolean;
  status: QRScanStatus;
  message: string;
  sessionId?: string;
  sessionInfo?: {
    title: string;
    classId: string;
    sessionDate: Date;
  };
}

export interface AttendanceReportEntry {
  studentId: string;
  studentName: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
}

export interface GetAttendanceReportRequest {
  classId: string;
  startDate: Date;
  endDate: Date;
}

export interface QRSessionWithStats extends QRAttendanceSession {
  stats?: QRAttendanceStats;
  attendees?: {
    studentId: string;
    studentName: string;
    scannedAt: Date;
  }[];
}

// ==================== ERROR TYPES ====================

export class QRAttendanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'QRAttendanceError';
  }
}

export const QRAttendanceErrorCodes = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ALREADY_SCANNED: 'ALREADY_SCANNED',
  LOCATION_REQUIRED: 'LOCATION_REQUIRED',
  OUTSIDE_RANGE: 'OUTSIDE_RANGE',
  MAX_SCANS_REACHED: 'MAX_SCANS_REACHED',
  INVALID_QR_CODE: 'INVALID_QR_CODE',
} as const;
