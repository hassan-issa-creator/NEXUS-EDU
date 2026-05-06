export class CreateEnrollmentDto {
  studentId: string;
  classId: string;
}

export class EnrollmentFilterDto {
  classId?: string;
  studentId?: string;
}
