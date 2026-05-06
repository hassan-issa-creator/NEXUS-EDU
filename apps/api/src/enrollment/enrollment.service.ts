import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEnrollmentDto) {
    // Check if enrollment already exists
    const existing = await this.prisma.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        classId: data.classId,
      },
    });

    if (existing) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Verify student exists and is a STUDENT
    const student = await this.prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    // Verify class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    return this.prisma.enrollment.create({
      data,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            academicYear: true,
          },
        },
      },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
            academicYear: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.enrollment.delete({
      where: { id },
    });
  }

  async bulkEnroll(studentIds: string[], classId: string) {
    const enrollments = studentIds.map((studentId) => ({
      studentId,
      classId,
    }));

    // Filter out existing enrollments
    const existing = await this.prisma.enrollment.findMany({
      where: {
        classId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const existingIds = new Set(existing.map((e) => e.studentId));
    const newEnrollments = enrollments.filter(
      (e) => !existingIds.has(e.studentId),
    );

    if (newEnrollments.length === 0) {
      return { created: 0, message: 'All students already enrolled' };
    }

    await this.prisma.enrollment.createMany({
      data: newEnrollments,
    });

    return {
      created: newEnrollments.length,
      skipped: existingIds.size,
    };
  }
}
