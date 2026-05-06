import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) { }

  private async createAuditLog(params: {
    action: string;
    entityId?: string;
    userId?: string;
    schoolId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    if (!('auditLog' in this.prisma) || !this.prisma.auditLog) {
      return;
    }

    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: 'assignment',
        entityId: params.entityId,
        userId: params.userId,
        schoolId: params.schoolId ?? undefined,
        metadata: params.metadata,
      },
    });
  }

  async create(data: CreateAssignmentDto, teacherId: string) {
    // Verify teacher teaches this subject
    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: { teacher: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.teacherId !== teacherId) {
      throw new ForbiddenException('You do not teach this subject');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        ...data,
        teacherId,
        schoolId: subject.schoolId,
        maxScore: data.maxScore || 100,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    await this.createAuditLog({
      action: 'assignment.created',
      entityId: assignment.id,
      userId: teacherId,
      schoolId: subject.schoolId,
      metadata: {
        subjectId: subject.id,
        title: assignment.title,
      },
    });

    return assignment;
  }

  async findAll(filters: { subjectId?: string } = {}) {
    const where: any = {};

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.assignment.findMany({
      where: { teacherId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            classSubjects: {
              include: {
                subject: {
                  include: {
                    assignments: {
                      include: {
                        subject: true,
                        submissions: {
                          where: { studentId },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const assignments = enrollments.flatMap((enrollment) => {
      const enrollmentClass = enrollment.class as typeof enrollment.class & {
        subjects?: Array<{ assignments: any[] }>;
      };
      const classSubjects =
        enrollmentClass.classSubjects ??
        enrollmentClass.subjects?.map((subject) => ({ subject })) ??
        [];

      return classSubjects.flatMap((classSubject) =>
        classSubject.subject.assignments.map((assignment) => ({
          ...assignment,
          classId: enrollment.classId,
          submission: assignment.submissions[0] || null,
          status: assignment.submissions[0]?.gradedAt
            ? 'graded'
            : assignment.submissions[0]
              ? 'submitted'
              : 'pending',
          grade: assignment.submissions[0]?.grade ?? assignment.submissions[0]?.score ?? null,
        })),
      );
    });

    const dedupedAssignments = new Map<string, (typeof assignments)[number]>();
    assignments.forEach((assignment) => {
      dedupedAssignments.set(assignment.id, assignment);
    });

    return Array.from(dedupedAssignments.values()).sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async update(id: string, data: UpdateAssignmentDto, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only edit your own assignments');
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id },
      data,
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.createAuditLog({
      action: 'assignment.updated',
      entityId: updatedAssignment.id,
      userId: teacherId,
      schoolId: updatedAssignment.schoolId,
      metadata: {
        title: updatedAssignment.title,
      },
    });

    return updatedAssignment;
  }

  async delete(id: string, teacherId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    const deletedAssignment = await this.prisma.assignment.delete({
      where: { id },
    });

    await this.createAuditLog({
      action: 'assignment.deleted',
      entityId: deletedAssignment.id,
      userId: teacherId,
      schoolId: deletedAssignment.schoolId,
      metadata: {
        title: deletedAssignment.title,
      },
    });

    return deletedAssignment;
  }

  async submit(
    assignmentId: string,
    data: SubmitAssignmentDto,
    studentId: string,
  ) {
    // Check if assignment exists
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if already submitted
    const existing = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (existing) {
      // Update existing submission
      return this.prisma.submission.update({
        where: { id: existing.id },
        data: {
          content: data.content,
          attachments: data.attachments || [],
          submittedAt: new Date(),
        },
      }).then(async (submission) => {
        const assignmentWithSchool = await this.prisma.assignment.findUnique({
          where: { id: assignmentId },
          select: { schoolId: true, title: true },
        });

        await this.createAuditLog({
          action: 'assignment.resubmitted',
          entityId: assignmentId,
          userId: studentId,
          schoolId: assignmentWithSchool?.schoolId,
          metadata: {
            submissionId: submission.id,
            title: assignmentWithSchool?.title,
          },
        });

        return submission;
      });
    }

    const submission = await this.prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        content: data.content,
        attachments: data.attachments || [],
      },
    });

    await this.createAuditLog({
      action: 'assignment.submitted',
      entityId: assignmentId,
      userId: studentId,
      schoolId: assignment.schoolId,
      metadata: {
        submissionId: submission.id,
        title: assignment.title,
      },
    });

    return submission;
  }

  async getSubmissions(assignmentId: string, teacherId: string) {
    // Verify teacher owns this assignment
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You can only view submissions for your assignments',
      );
    }

    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(
    submissionId: string,
    data: GradeSubmissionDto,
    teacherId: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.assignment.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You can only grade submissions for your assignments',
      );
    }

    const gradedSubmission = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: data.score,
        feedback: data.feedback,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.createAuditLog({
      action: 'assignment.graded',
      entityId: submission.assignmentId,
      userId: teacherId,
      schoolId: submission.assignment.schoolId,
      metadata: {
        submissionId,
        studentId: gradedSubmission.student.id,
        score: data.score,
      },
    });

    return gradedSubmission;
  }
}
