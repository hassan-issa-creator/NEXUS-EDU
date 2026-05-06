import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLessonDto, teacherId: string) {
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

    return this.prisma.lesson.create({
      data: {
        ...data,
        authorId: teacherId,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(filters: { subjectId?: string } = {}) {
    const where: Prisma.LessonWhereInput = {};

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    return this.prisma.lesson.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.lesson.findMany({
      where: { authorId: teacherId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
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
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(id: string, data: UpdateLessonDto, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.authorId !== teacherId) {
      throw new ForbiddenException('You can only edit your own lessons');
    }

    return this.prisma.lesson.update({
      where: { id },
      data,
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.authorId !== teacherId) {
      throw new ForbiddenException('You can only delete your own lessons');
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
