import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma.service';

describe('AssignmentService', () => {
    let service: AssignmentService;
    let prisma: PrismaService;

    const mockPrismaService = {
        subject: {
            findUnique: jest.fn(),
        },
        assignment: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        enrollment: {
            findMany: jest.fn(),
        },
        submission: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AssignmentService>(AssignmentService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            title: 'Test Assignment',
            description: 'Test Desc',
            dueDate: new Date(),
            subjectId: 'sub1',
            maxScore: 100,
        };

        it('should throw NotFoundException if subject not found', async () => {
            mockPrismaService.subject.findUnique.mockResolvedValue(null);
            await expect(service.create(createDto, 't1')).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if teacher does not teach the subject', async () => {
            mockPrismaService.subject.findUnique.mockResolvedValue({ teacherId: 't2' });
            await expect(service.create(createDto, 't1')).rejects.toThrow(ForbiddenException);
        });

        it('should create an assignment successfully', async () => {
            mockPrismaService.subject.findUnique.mockResolvedValue({ teacherId: 't1' });
            mockPrismaService.assignment.create.mockResolvedValue({ id: 'a1', ...createDto });

            const result = await service.create(createDto, 't1');
            expect(result).toHaveProperty('id', 'a1');
            expect(mockPrismaService.assignment.create).toHaveBeenCalled();
        });
    });

    describe('findAll and findByTeacher', () => {
        it('should find all assignments', async () => {
            mockPrismaService.assignment.findMany.mockResolvedValue([{ id: 'a1' }]);
            const result = await service.findAll();
            expect(result).toHaveLength(1);
        });

        it('should find assignments by teacher', async () => {
            mockPrismaService.assignment.findMany.mockResolvedValue([{ id: 'a1', teacherId: 't1' }]);
            const result = await service.findByTeacher('t1');
            expect(result).toHaveLength(1);
            expect(mockPrismaService.assignment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { teacherId: 't1' } })
            );
        });
    });

    describe('findByStudent', () => {
        it('should filter classes and map assignments correctly', async () => {
            const mockEnrollments = [{
                class: {
                    subjects: [{
                        assignments: [{ id: 'a1', submissions: [] }]
                    }]
                }
            }];
            mockPrismaService.enrollment.findMany.mockResolvedValue(mockEnrollments);

            const result = await service.findByStudent('s1');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('a1');
            expect(result[0].submission).toBeNull();
        });
    });
});
