import { IsString, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  subjectId: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class SubmitAssignmentDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class GradeSubmissionDto {
  @IsNumber()
  score: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class AssignmentFilterDto {
  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;
}
