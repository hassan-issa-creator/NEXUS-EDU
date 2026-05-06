/**
 * Admin Portal Types
 * Type definitions for admin management system
 */

export type PermissionScope =
  | 'users'
  | 'classes'
  | 'subjects'
  | 'assignments'
  | 'grades'
  | 'exams'
  | 'content'
  | 'chat'
  | 'games'
  | 'attendance'
  | 'reports'
  | 'settings'
  | 'system';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export';
export type ActivityType =
  | 'login'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'settings';

// ==================== ADMIN ROLE TYPES ====================

export interface AdminPermissions {
  [scope: string]: {
    [action: string]: boolean;
  };
}

export interface AdminRole {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  permissions: AdminPermissions;
  isSuperAdmin: boolean;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAdminRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string;
  assignedAt: Date;
  schoolId?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  role?: AdminRole;
}

// ==================== ADMIN ACTIVITY ====================

export interface AdminActivityLog {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  activityType: ActivityType;
  resourceType: string;
  resourceId?: string;
  action: string;
  description?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ==================== SYSTEM SETTINGS ====================

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  modifiedBy?: string;
  modifiedAt: Date;
  createdAt: Date;
}

export interface SystemStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalAdmins: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  totalExams: number;
  totalContentItems: number;
  totalGames: number;
  recentSubmissions: number;
  recentAttendance: number;
  totalStorageBytes: number;
  lastUpdated: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateRoleRequest {
  name: string;
  nameAr?: string;
  description?: string;
  permissions: AdminPermissions;
  priority?: number;
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
  schoolId?: string;
  expiresAt?: Date;
}

export interface UpdateSettingRequest {
  category: string;
  key: string;
  value: any;
  description?: string;
}

export interface GetActivityLogRequest {
  userId?: string;
  activityType?: ActivityType;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ==================== ADMIN DASHBOARD ====================

export interface AdminDashboardOverview {
  statistics: SystemStatistics;
  recentActivity: AdminActivityLog[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    activeUsers: number;
    responseTime: number;
  };
  alerts: {
    type: 'info' | 'warning' | 'error';
    message: string;
    count: number;
  }[];
}

// ==================== USER MANAGEMENT ====================

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'assignRole' | 'removeRole';
  data?: any;
}

export interface UserManagementFilters {
  role?: string;
  school?: string;
  status?: 'active' | 'inactive';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==================== ERROR TYPES ====================

export class AdminPortalError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AdminPortalError';
  }
}

export const AdminPortalErrorCodes = {
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  CANNOT_MODIFY_SUPER_ADMIN: 'CANNOT_MODIFY_SUPER_ADMIN',
  INVALID_PERMISSION: 'INVALID_PERMISSION',
} as const;
