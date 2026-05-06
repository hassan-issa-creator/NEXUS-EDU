import millionService from './million.service';
import { query } from '../../config/database';

jest.mock('../../config/database', () => ({
  query: jest.fn(),
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

function emptyResult(command: string = 'SELECT') {
  return {
    rows: [],
    rowCount: 0,
    command,
    oid: 0,
    fields: [],
  };
}

describe('MillionService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('createRoom', () => {
    it('creates a room and initializes the host as a participant', async () => {
      const room = {
        id: 'room-123',
        title: 'غرفة العلوم',
        host_id: 'host-123',
        type: 'public',
        status: 'waiting',
        settings: { maxPlayers: 10, questionCount: 10, timeLimit: 15, difficulty: 'mixed' },
      };

      mockQuery
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rows: [room], rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 });

      const result = await millionService.createRoom(
        room.host_id,
        room.title,
        room.type as any,
      );

      expect(result).toEqual(room);
      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO million_rooms'),
        expect.arrayContaining([room.title, room.host_id, room.type]),
      );
    });
  });

  describe('joinRoom', () => {
    it('joins a room for a new participant', async () => {
      const room = {
        id: 'room-123',
        host_id: 'host-123',
        status: 'waiting',
        settings: { maxPlayers: 10 },
      };

      mockQuery
        .mockResolvedValueOnce({ ...emptyResult(), rows: [room], rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult(), rows: [{ count: '2' }], rowCount: 1 })
        .mockResolvedValueOnce(emptyResult())
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 });

      const result = await millionService.joinRoom('user-123', room.id);

      expect(result).toEqual(room);
      expect(mockQuery).toHaveBeenCalledTimes(5);
      expect(mockQuery).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining('INSERT INTO million_room_participants'),
        [room.id, 'user-123'],
      );
    });

    it('reactivates an existing participant instead of throwing', async () => {
      const room = {
        id: 'room-123',
        host_id: 'host-123',
        status: 'waiting',
        settings: { maxPlayers: 10 },
      };

      mockQuery
        .mockResolvedValueOnce({ ...emptyResult(), rows: [room], rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult(), rows: [{ count: '3' }], rowCount: 1 })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ room_id: room.id, user_id: 'user-123', is_active: false }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ ...emptyResult('UPDATE'), rowCount: 1 });

      const result = await millionService.joinRoom('user-123', room.id);

      expect(result).toEqual(room);
      expect(mockQuery).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining('UPDATE million_room_participants'),
        [room.id, 'user-123'],
      );
    });

    it('throws when the room is full', async () => {
      mockQuery
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 'room-123', settings: { maxPlayers: 2 } }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ count: '2' }],
          rowCount: 1,
        });

      await expect(millionService.joinRoom('user-123', 'room-123')).rejects.toThrow(
        'Room is full',
      );
    });

    it('throws when the room does not exist', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult());

      await expect(millionService.joinRoom('user-123', 'missing-room')).rejects.toThrow(
        'Room not found',
      );
    });
  });

  describe('startRound', () => {
    it('starts a round for the host and assigns questions', async () => {
      const room = {
        id: 'room-123',
        host_id: 'host-123',
        settings: { questionCount: 3, difficulty: 'mixed' },
      };
      const round = {
        id: 'round-123',
        room_id: room.id,
        round_number: 1,
        started_at: new Date(),
      };

      mockQuery
        .mockResolvedValueOnce({ ...emptyResult(), rows: [room], rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('UPDATE'), rowCount: 1 })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ max_round: 0 }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rows: [round], rowCount: 1 })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
          rowCount: 3,
        })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 });

      const result = await millionService.startRound(room.id, room.host_id);

      expect(result).toEqual(round);
      expect(mockQuery).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('SELECT COALESCE(MAX(round_number), 0) as max_round'),
        [room.id],
      );
    });

    it('throws when a non-host tries to start a round', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult());

      await expect(millionService.startRound('room-123', 'user-456')).rejects.toThrow(
        'Only the host can start a round',
      );
    });
  });

  describe('submitAnswer', () => {
    it('awards points for a correct answer', async () => {
      mockQuery
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 'round-123', room_id: 'room-123' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce(emptyResult())
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 1, correct_index: 2, difficulty: 3 }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ settings: { timeLimit: 15 } }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ count: '0' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ streak: '2' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('UPDATE'), rowCount: 1 });

      const result = await millionService.submitAnswer('user-123', 'room-123', 1, 2, 5);

      expect(result.isCorrect).toBe(true);
      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(result.correctIndex).toBe(2);
    });

    it('returns zero points for an incorrect answer', async () => {
      mockQuery
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 'round-123', room_id: 'room-123' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce(emptyResult())
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 1, correct_index: 2, difficulty: 3 }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ settings: { timeLimit: 15 } }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ count: '0' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ streak: '0' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ ...emptyResult('INSERT'), rowCount: 1 })
        .mockResolvedValueOnce({ ...emptyResult('UPDATE'), rowCount: 1 });

      const result = await millionService.submitAnswer('user-123', 'room-123', 1, 0, 5);

      expect(result).toEqual({
        isCorrect: false,
        pointsAwarded: 0,
        correctIndex: 2,
      });
    });

    it('rejects duplicate submissions', async () => {
      mockQuery
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ id: 'round-123', room_id: 'room-123' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          ...emptyResult(),
          rows: [{ user_id: 'user-123' }],
          rowCount: 1,
        });

      await expect(
        millionService.submitAnswer('user-123', 'room-123', 1, 0, 5),
      ).rejects.toThrow('Answer already submitted');
    });

    it('throws when there is no active round', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult());

      await expect(
        millionService.submitAnswer('user-123', 'room-123', 1, 0, 5),
      ).rejects.toThrow('No active round');
    });
  });

  describe('read methods', () => {
    it('returns room details', async () => {
      mockQuery.mockResolvedValueOnce({
        ...emptyResult(),
        rows: [
          {
            id: 'room-123',
            title: 'غرفة العلوم',
            host_id: 'host-123',
            host_name: 'المعلم',
            participant_count: '2',
          },
        ],
        rowCount: 1,
      });

      const room = await millionService.getRoom('room-123');

      expect(room.id).toBe('room-123');
      expect(room.host_name).toBe('المعلم');
    });

    it('throws when getRoom cannot find a room', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult());

      await expect(millionService.getRoom('missing-room')).rejects.toThrow(
        'Room not found',
      );
    });

    it('returns a leaderboard sorted by total points', async () => {
      mockQuery.mockResolvedValueOnce({
        ...emptyResult(),
        rows: [
          {
            userId: 'user-1',
            name: 'A',
            avatar: null,
            totalPoints: 500,
            correctAnswers: 8,
            questionsAnswered: 10,
            rank: 1,
          },
          {
            userId: 'user-2',
            name: 'B',
            avatar: null,
            totalPoints: 300,
            correctAnswers: 6,
            questionsAnswered: 10,
            rank: 2,
          },
        ],
        rowCount: 2,
      });

      const leaderboard = await millionService.getLeaderboard('room-123');

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].totalPoints).toBe(500);
      expect(leaderboard[1].rank).toBe(2);
    });

    it('returns user history entries', async () => {
      mockQuery.mockResolvedValueOnce({
        ...emptyResult(),
        rows: [
          { room_id: 'room-1', title: 'Game 1', total_points: 500 },
          { room_id: 'room-2', title: 'Game 2', total_points: 250 },
        ],
        rowCount: 2,
      });

      const history = await millionService.getUserHistory('user-123', 10);

      expect(history).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM million_rooms r'),
        ['user-123', 10],
      );
    });

    it('returns round questions in order', async () => {
      mockQuery.mockResolvedValueOnce({
        ...emptyResult(),
        rows: [
          { id: 1, text_ar: 'سؤال 1', options: ['أ', 'ب', 'ج', 'د'], correct_index: 0 },
          { id: 2, text_ar: 'سؤال 2', options: ['أ', 'ب', 'ج', 'د'], correct_index: 1 },
        ],
        rowCount: 2,
      });

      const questions = await millionService.getRoundQuestions('round-123');

      expect(questions).toHaveLength(2);
      expect(questions[0].text_ar).toBe('سؤال 1');
    });
  });

  describe('finishRound', () => {
    it('marks the round as finished', async () => {
      mockQuery.mockResolvedValueOnce({ ...emptyResult('UPDATE'), rowCount: 1 });

      await expect(millionService.finishRound('round-123')).resolves.toBeUndefined();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE million_rounds'),
        ['round-123'],
      );
    });
  });
});
