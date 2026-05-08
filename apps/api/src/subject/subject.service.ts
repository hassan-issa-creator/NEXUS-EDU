import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: createSubjectDto });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        class: { select: { name: true } },
        teacher: { select: { name: true, email: true } },
        _count: { select: { lessons: true, assignments: true } },
      },
    });
  }

  /** Returns subjects for a student via their enrollment → class → subjects */
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
                    teacher: { select: { id: true, name: true, email: true } },
                    _count: { select: { lessons: true, assignments: true } },
                  },
                },
              },
            },
            subjects: {
              include: {
                teacher: { select: { id: true, name: true, email: true } },
                _count: { select: { lessons: true, assignments: true } },
              },
            },
          },
        },
      },
    });

    const subjectMap = new Map<string, any>();

    for (const enrollment of enrollments) {
      const cls = enrollment.class as any;
      const subjects =
        cls.classSubjects?.map((cs: any) => cs.subject) ??
        cls.subjects ??
        [];
      for (const subject of subjects) {
        if (subject && !subjectMap.has(subject.id)) {
          subjectMap.set(subject.id, {
            ...subject,
            className: cls.name,
            classId: enrollment.classId,
          });
        }
      }
    }

    return Array.from(subjectMap.values());
  }

  /** Returns subjects taught by a specific teacher */
  async findByTeacher(teacherId: string) {
    return this.prisma.subject.findMany({
      where: { teacherId },
      include: {
        class: { select: { id: true, name: true } },
        _count: { select: { lessons: true, assignments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { class: true, teacher: true, lessons: true, assignments: true },
    });
    if (!subject) throw new NotFoundException(`Subject with ID ${id} not found`);
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    return this.prisma.subject.update({ where: { id }, data: updateSubjectDto });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }
}
