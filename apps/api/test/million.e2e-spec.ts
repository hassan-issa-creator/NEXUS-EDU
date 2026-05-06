import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateToken } from '../src/middleware/auth.middleware';
import { Server } from 'http';

describe('Million API (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let authToken: string;
  let userId: string;
  let roomId: string;
  let roundId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    // Generate test JWT token
    userId = '123e4567-e89b-12d3-a456-426614174000';
    authToken = generateToken({
      id: userId,
      email: 'test@example.com',
      role: 'student',
      name: 'Test User',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/million/create-room', () => {
    it('should create a new room with authentication', () => {
      return request(httpServer)
        .post('/api/million/create-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'غرفة الرياضيات',
          type: 'public',
          settings: {
            questionCount: 10,
            timeLimit: 15,
            difficulty: 'mixed',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.title).toBe('غرفة الرياضيات');
          roomId = res.body.data.id; // Save for later tests
        });
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .post('/api/million/create-room')
        .send({
          title: 'غرفة اختبار',
          type: 'public',
        })
        .expect(401);
    });

    it('should return 400 with invalid data', () => {
      return request(httpServer)
        .post('/api/million/create-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'ab', // Too short (min 3 chars)
          type: 'invalid-type',
        })
        .expect(400);
    });

    it('should return 400 with missing required fields', () => {
      return request(httpServer)
        .post('/api/million/create-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing title and type
        })
        .expect(400);
    });
  });

  describe('POST /api/million/join-room', () => {
    it('should join an existing room', () => {
      return request(httpServer)
        .post('/api/million/join-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId, // Use the room created in previous test
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
        });
    });

    it('should return 404 for non-existent room', () => {
      return request(httpServer)
        .post('/api/million/join-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('should return 400 with invalid UUID', () => {
      return request(httpServer)
        .post('/api/million/join-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: 'invalid-uuid',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .post('/api/million/join-room')
        .send({
          roomId: roomId,
        })
        .expect(401);
    });
  });

  describe('GET /api/million/room/:roomId', () => {
    it('should get room details', () => {
      return request(httpServer)
        .get(`/api/million/room/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(roomId);
        });
    });

    it('should return 404 for non-existent room', () => {
      return request(httpServer)
        .get('/api/million/room/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 with invalid UUID', () => {
      return request(httpServer)
        .get('/api/million/room/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer).get(`/api/million/room/${roomId}`).expect(401);
    });
  });

  describe('POST /api/million/start-round', () => {
    it('should start a round as host', () => {
      return request(httpServer)
        .post('/api/million/start-round')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.room_id).toBe(roomId);
          roundId = res.body.data.id; // Save for later tests
        });
    });

    it('should return 403 if non-host tries to start round', () => {
      // Create a new token for a different user
      const otherUserToken = generateToken({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'other@example.com',
        role: 'student',
        name: 'Other User',
      });

      return request(httpServer)
        .post('/api/million/start-round')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          roomId: roomId,
        })
        .expect(403);
    });

    it('should return 404 for non-existent room', () => {
      return request(httpServer)
        .post('/api/million/start-round')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .post('/api/million/start-round')
        .send({
          roomId: roomId,
        })
        .expect(401);
    });
  });

  describe('POST /api/million/answer', () => {
    it('should submit an answer', () => {
      return request(httpServer)
        .post('/api/million/answer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
          questionId: 1,
          chosenIndex: 2,
          timeTaken: 5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.isCorrect).toBeDefined();
          expect(res.body.data.pointsAwarded).toBeDefined();
        });
    });

    it('should return 400 with invalid answer index', () => {
      return request(httpServer)
        .post('/api/million/answer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
          questionId: 1,
          chosenIndex: 5, // Invalid (should be 0-3)
          timeTaken: 5,
        })
        .expect(400);
    });

    it('should return 400 with negative time taken', () => {
      return request(httpServer)
        .post('/api/million/answer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
          questionId: 1,
          chosenIndex: 2,
          timeTaken: -5, // Invalid
        })
        .expect(400);
    });

    it('should return 400 on duplicate answer submission', () => {
      // Try to submit the same answer again
      return request(httpServer)
        .post('/api/million/answer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
          questionId: 1,
          chosenIndex: 2,
          timeTaken: 5,
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .post('/api/million/answer')
        .send({
          roomId: roomId,
          questionId: 1,
          chosenIndex: 2,
          timeTaken: 5,
        })
        .expect(401);
    });
  });

  describe('GET /api/million/leaderboard/:roomId', () => {
    it('should get leaderboard for a room', () => {
      return request(httpServer)
        .get(`/api/million/leaderboard/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return leaderboard sorted by points', () => {
      return request(httpServer)
        .get(`/api/million/leaderboard/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const leaderboard = res.body.data;
          if (leaderboard.length > 1) {
            // Check if sorted descending by points
            for (let i = 0; i < leaderboard.length - 1; i++) {
              expect(leaderboard[i].totalPoints).toBeGreaterThanOrEqual(
                leaderboard[i + 1].totalPoints,
              );
            }
          }
        });
    });

    it('should return 400 with invalid UUID', () => {
      return request(httpServer)
        .get('/api/million/leaderboard/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .get(`/api/million/leaderboard/${roomId}`)
        .expect(401);
    });
  });

  describe('GET /api/million/history/:userId', () => {
    it('should get user history', () => {
      return request(httpServer)
        .get(`/api/million/history/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should accept limit query parameter', () => {
      return request(httpServer)
        .get(`/api/million/history/${userId}?limit=5`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('should return 403 when viewing other users history', () => {
      // Try to view another user's history
      const otherUserId = '00000000-0000-0000-0000-000000000001';

      return request(httpServer)
        .get(`/api/million/history/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should allow admin to view any user history', () => {
      // Create admin token
      const adminToken = generateToken({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
      });

      const someUserId = '00000000-0000-0000-0000-000000000001';

      return request(httpServer)
        .get(`/api/million/history/${someUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 400 with invalid UUID', () => {
      return request(httpServer)
        .get('/api/million/history/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .get(`/api/million/history/${userId}`)
        .expect(401);
    });
  });

  describe('POST /api/million/leave-room', () => {
    it('should leave a room', () => {
      return request(httpServer)
        .post('/api/million/leave-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: roomId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 with invalid UUID', () => {
      return request(httpServer)
        .post('/api/million/leave-room')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: 'invalid-uuid',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(httpServer)
        .post('/api/million/leave-room')
        .send({
          roomId: roomId,
        })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on answer endpoint', async () => {
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          request(httpServer)
            .post('/api/million/answer')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              roomId: roomId,
              questionId: i + 10, // Different questions
              chosenIndex: 0,
              timeTaken: 5,
            }),
        );
      }

      const responses = await Promise.all(requests);

      // Some should be rate limited (429)
      const rateLimited = responses.filter((res) => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should return health status', () => {
      return request(httpServer)
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });
});
