export class CreateAssignmentDto {
  title: string;
  description?: string;
  subjectId: string;
  dueDate?: Date;
  maxScore?: number;
  attachments?: string[];
}

export class UpdateAssignmentDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  maxScore?: number;
  attachments?: string[];
}

export class SubmitAssignmentDto {
  content?: string;
  attachments?: string[];
}

export class GradeSubmissionDto {
  score: number;
  feedback?: string;
}

export class AssignmentFilterDto {
  subjectId?: string;
  teacherId?: string;
}
