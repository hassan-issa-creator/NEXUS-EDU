import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

/**
 * Platform-wide real-time events gateway.
 * Handles notifications, assignments, grades, attendance, and more.
 *
 * Room Strategy:
 *   user:{userId}      – personal user room (notifications, grades, DMs)
 *   class:{classId}    – class room (new assignments, announcements)
 *   school:{schoolId}  – school-wide broadcasts
 */
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: 'events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  // Map of userId → socket ids (a user can have multiple tabs open)
  private userSocketMap = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  // ─────────────────────────────────────────
  // Connection lifecycle
  // ─────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect(true);
        return;
      }

      const secret = process.env.JWT_SECRET || 'secret';
      const payload = this.jwtService.verify(token, { secret });
      client.data.user = payload;

      const userId: string = payload.sub || payload.userId || payload.id;
      const schoolId: string | undefined = payload.schoolId;

      // Personal room
      client.join(`user:${userId}`);

      // School room
      if (schoolId) {
        client.join(`school:${schoolId}`);
      }

      // Track sockets per user
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, new Set());
      }
      this.userSocketMap.get(userId)!.add(client.id);

      this.logger.log(`[CONNECT] user:${userId} socket:${client.id}`);

      // Confirm connection to client
      client.emit('connected', { userId, timestamp: new Date().toISOString() });
    } catch (e) {
      this.logger.warn(`[AUTH FAIL] ${client.id}: ${(e as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub || client.data.user?.userId;
    if (userId && this.userSocketMap.has(userId)) {
      this.userSocketMap.get(userId)!.delete(client.id);
      if (this.userSocketMap.get(userId)!.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }
    this.logger.log(`[DISCONNECT] socket:${client.id}`);
  }

  // ─────────────────────────────────────────
  // Client → Server: Join class rooms
  // ─────────────────────────────────────────
  @SubscribeMessage('joinClass')
  handleJoinClass(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: string },
  ) {
    client.join(`class:${data.classId}`);
    return { event: 'classJoined', data: { classId: data.classId } };
  }

  @SubscribeMessage('leaveClass')
  handleLeaveClass(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: string },
  ) {
    client.leave(`class:${data.classId}`);
  }

  // ─────────────────────────────────────────
  // Server → Client: Emitters (called by services)
  // ─────────────────────────────────────────

  /** Push a new assignment to an entire class */
  emitNewAssignment(classId: string, assignment: Record<string, any>) {
    this.server.to(`class:${classId}`).emit('new_assignment', assignment);
    this.logger.log(`[EMIT] new_assignment → class:${classId}`);
  }

  /** Push a grade update to a specific student (and their parents) */
  emitGradeUpdate(userId: string, grade: Record<string, any>) {
    this.server.to(`user:${userId}`).emit('grade_updated', grade);
    this.logger.log(`[EMIT] grade_updated → user:${userId}`);
  }

  /** Push attendance status to a user (student / parents) */
  emitAttendanceMarked(userId: string, attendance: Record<string, any>) {
    this.server.to(`user:${userId}`).emit('attendance_marked', attendance);
    this.logger.log(`[EMIT] attendance_marked → user:${userId}`);
  }

  /** Push a notification to a specific user */
  emitNotification(userId: string, notification: Record<string, any>) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
    this.logger.log(`[EMIT] new_notification → user:${userId}`);
  }

  /** Push a real-time message to a user */
  emitMessage(userId: string, message: Record<string, any>) {
    this.server.to(`user:${userId}`).emit('new_message', message);
    this.logger.log(`[EMIT] new_message → user:${userId}`);
  }

  /** Broadcast a school-wide announcement */
  emitSchoolAnnouncement(schoolId: string, announcement: Record<string, any>) {
    this.server.to(`school:${schoolId}`).emit('school_announcement', announcement);
    this.logger.log(`[EMIT] school_announcement → school:${schoolId}`);
  }

  /** Assignment auto-graded by AI — notify teacher */
  emitAssignmentGraded(teacherId: string, result: Record<string, any>) {
    this.server.to(`user:${teacherId}`).emit('assignment_graded', result);
    this.logger.log(`[EMIT] assignment_graded → user:${teacherId}`);
  }

  /** Check if a user is currently online */
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId) && this.userSocketMap.get(userId)!.size > 0;
  }

  /** Get count of connected users */
  getConnectedUsersCount(): number {
    return this.userSocketMap.size;
  }
}
