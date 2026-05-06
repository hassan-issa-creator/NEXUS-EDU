/**
 * Content Platform Types
 * Type definitions for educational content management
 */

export type ContentType =
  | 'video'
  | 'document'
  | 'link'
  | 'interactive'
  | 'audio';
export type AccessLevel = 'public' | 'enrolled' | 'premium';

// ==================== CONTENT TYPES ====================

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  fileUrl?: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  durationSeconds?: number;
  fileSize?: number;
  mimeType?: string;
  subjectId?: string;
  classId?: string;
  categoryId?: string;
  tags: string[];
  orderIndex: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  accessLevel: AccessLevel;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCategory {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  children?: ContentCategory[];
}

export interface ContentProgress {
  id: string;
  contentId: string;
  userId: string;
  progressPercentage: number;
  lastPositionSeconds: number;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpentSeconds: number;
  viewsCount: number;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  parentId?: string;
  commentText: string;
  timestampSeconds?: number;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  replies?: ContentComment[];
}

export interface ContentLike {
  id: string;
  contentId: string;
  userId: string;
  createdAt: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateContentRequest {
  title: string;
  description?: string;
  contentType: ContentType;
  externalUrl?: string;
  subjectId?: string;
  classId?: string;
  categoryId?: string;
  tags?: string[];
  accessLevel?: AccessLevel;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UploadContentRequest extends CreateContentRequest {
  file?: any; // File from multer
}

export interface UpdateProgressRequest {
  progressPercentage?: number;
  lastPositionSeconds?: number;
  timeSpentSeconds?: number;
}

export interface CreateCommentRequest {
  commentText: string;
  parentId?: string;
  timestampSeconds?: number;
}

export interface GetContentListRequest {
  contentType?: ContentType;
  subjectId?: string;
  classId?: string;
  categoryId?: string;
  tags?: string[];
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'title';
}

export interface ContentWithProgress extends ContentItem {
  progress?: ContentProgress;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface LearningStats {
  totalContent: number;
  completedContent: number;
  inProgressContent: number;
  totalTimeSpent: number;
  completionRate: number;
}

export interface PopularContent {
  contentId: string;
  title: string;
  contentType: ContentType;
  viewsCount: number;
  likesCount: number;
  avgCompletionRate: number;
}

// ==================== ERROR TYPES ====================

export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

export const ContentErrorCodes = {
  CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
  INVALID_FILE: 'INVALID_FILE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
} as const;
