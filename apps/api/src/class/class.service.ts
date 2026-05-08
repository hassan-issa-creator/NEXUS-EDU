import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(createClassDto: CreateClassDto) {
    await this.cacheManager.del('all_classes'); // Invalidate cache
    return this.prisma.class.create({
      data: createClassDto as any,
    });
  }

  async findAll() {
    const cachedClasses = await this.cacheManager.get('all_classes');
    if (cachedClasses) {
      return cachedClasses;
    }

    const classes = await this.prisma.class.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { students: true, subjects: true },
        },
      },
    });

    await this.cacheManager.set('all_classes', classes, 60000); // Cache for 1 minute
    return classes;
  }

  async findOne(id: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
        subjects: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    return this.prisma.class.update({
      where: { id },
      data: updateClassDto,
    });
  }

  async remove(id: string) {
    return this.prisma.class.delete({
      where: { id },
    });
  }

  async findStudentClasses(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            teacher: {
              select: { name: true }
            }
          }
        }
      }
    });

    return enrollments.map(e => ({
      id: e.class.id,
      name: e.class.name,
      teacher: e.class.teacher?.name || 'Unknown',
      schedule: 'Mon, Wed 10:00 AM', // In a real app, this would come from ClassSubject schedule
      room: 'Main Room',
      nextClass: new Date().toISOString(),
      isLive: false,
      joinLink: `/student/classroom/${e.class.id}`,
    }));
  }
}
