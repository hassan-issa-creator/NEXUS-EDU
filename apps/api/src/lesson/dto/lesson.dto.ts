export class CreateLessonDto {
  title: string;
  content?: string;
  videoUrl?: string;
  attachments?: string[]; // Array of file URLs
  subjectId: string;
}

export class UpdateLessonDto {
  title?: string;
  content?: string;
  videoUrl?: string;
  attachments?: string[];
}

export class LessonFilterDto {
  subjectId?: string;
  teacherId?: string;
}
