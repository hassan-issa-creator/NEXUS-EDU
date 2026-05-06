import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma.service';

describe('GamificationService', () => {
    let service: GamificationService;

    const mockPrismaService = {
        millionProfile: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            upsert: jest.fn(),
        },
        userAchievement: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
        achievement: {
            upsert: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamificationService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<GamificationService>(GamificationService);
        jest.clearAllMocks();
    });

    describe('getBadges', () => {
        it('should return all available badges', () => {
            const badges = service.getBadges();
            expect(badges.length).toBeGreaterThan(0);
            expect(badges[0]).toHaveProperty('id');
            expect(badges[0]).toHaveProperty('points');
        });
    });

    describe('getLeaderboard', () => {
        it('should return a list of leaderboard entries with earned badges', async () => {
            mockPrismaService.millionProfile.findMany.mockResolvedValue([
                { userId: 'user1', totalPoints: 100, user: { name: 'Ali', avatar: null } },
                { userId: 'user2', totalPoints: 50, user: { name: 'Sara', avatar: 'pic.png' } },
            ]);
            mockPrismaService.userAchievement.findMany.mockResolvedValue([
                { userId: 'user1', achievement: { key: 'first_quiz' } },
            ]);

            const result = await service.getLeaderboard(10);

            expect(result).toHaveLength(2);
            expect(result[0].rank).toBe(1);
            expect(result[0].userId).toBe('user1');
            expect(result[0].badges).toContain('first_quiz');
            expect(result[1].rank).toBe(2);
            expect(result[1].userId).toBe('user2');
            expect(result[1].badges).toHaveLength(0);
        });
    });

    describe('getUserRank', () => {
        it('should return 0 rank and points if user profile does not exist', async () => {
            mockPrismaService.millionProfile.findUnique.mockResolvedValue(null);

            const result = await service.getUserRank('non_existent');

            expect(result.rank).toBe(0);
            expect(result.points).toBe(0);
            expect(result.badges).toEqual([]);
        });

        it('should return the correct rank and badges for a user', async () => {
            mockPrismaService.millionProfile.findUnique.mockResolvedValue({
                userId: 'user1',
                totalPoints: 120,
            });
            mockPrismaService.millionProfile.count.mockResolvedValue(3);
            mockPrismaService.userAchievement.findMany.mockResolvedValue([
                { achievement: { key: 'first_quiz' } },
            ]);

            const result = await service.getUserRank('user1');

            expect(result.rank).toBe(4);
            expect(result.points).toBe(120);
            expect(result.badges[0].id).toBe('first_quiz');
        });
    });

    describe('awardPoints', () => {
        it('should upsert the million profile with incremented points', async () => {
            mockPrismaService.millionProfile.upsert.mockResolvedValue({});

            await service.awardPoints('user1', 50, 'Finished lesson');

            expect(mockPrismaService.millionProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user1' },
                    update: { totalPoints: { increment: 50 } },
                }),
            );
        });
    });

    describe('awardBadge', () => {
        it('should return null if badge does not exist', async () => {
            const result = await service.awardBadge('user1', 'non_existent_badge');
            expect(result).toBeNull();
        });

        it('should upsert the achievement and user achievement and return badge details', async () => {
            mockPrismaService.achievement.upsert.mockResolvedValue({ id: 'achievement-1' });
            mockPrismaService.userAchievement.upsert.mockResolvedValue({});

            const result = await service.awardBadge('user1', 'first_quiz');

            expect(result).toBeDefined();
            expect(result!.id).toBe('first_quiz');
            expect(mockPrismaService.achievement.upsert).toHaveBeenCalled();
            expect(mockPrismaService.userAchievement.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId_achievementId: {
                            userId: 'user1',
                            achievementId: 'achievement-1',
                        },
                    },
                }),
            );
        });
    });

    describe('checkBadges', () => {
        it('should check requirements and award eligible badges', async () => {
            const stats = { quiz_count: 5 };

            mockPrismaService.achievement.upsert.mockResolvedValue({ id: 'achievement-1' });
            mockPrismaService.userAchievement.upsert.mockResolvedValue({});

            const result = await service.checkBadges('user1', stats);

            expect(result.length).toBeGreaterThan(0);
            expect(result.map(b => b.id)).toContain('first_quiz');
            expect(mockPrismaService.userAchievement.upsert).toHaveBeenCalled();
        });
    });
});
