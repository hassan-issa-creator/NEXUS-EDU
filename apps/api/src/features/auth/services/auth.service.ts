import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SCHOOL_ID = 'default-school';
const DEFAULT_SCHOOL_SLUG = 'default-school';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    private async ensureDefaultSchool() {
        if (!('school' in this.prisma) || !this.prisma.school) {
            return {
                id: DEFAULT_SCHOOL_ID,
                slug: DEFAULT_SCHOOL_SLUG,
                name: 'Default School',
                isActive: true,
            };
        }

        return this.prisma.school.upsert({
            where: { slug: DEFAULT_SCHOOL_SLUG },
            update: { isActive: true },
            create: {
                id: DEFAULT_SCHOOL_ID,
                name: 'Default School',
                slug: DEFAULT_SCHOOL_SLUG,
                description: 'Backfilled school for legacy data and local onboarding',
                isActive: true,
            },
        });
    }

    private async createAuditLog(data: {
        schoolId?: string | null;
        userId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        metadata?: Prisma.InputJsonValue;
    }) {
        if (!('auditLog' in this.prisma) || !this.prisma.auditLog) {
            return;
        }

        await this.prisma.auditLog.create({
            data: {
                schoolId: data.schoolId ?? undefined,
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                metadata: data.metadata,
            },
        });
    }

    private isPlatformAdmin(role: string): boolean {
        return role === 'ADMIN';
    }

    private async resolveSchoolId(role: string, schoolId?: string): Promise<string | null> {
        if (schoolId) {
            const school = await this.prisma.school.findUnique({
                where: { id: schoolId },
                select: { id: true, isActive: true },
            });

            if (!school?.isActive) {
                throw new BadRequestException('School not found or inactive');
            }

            return school.id;
        }

        const defaultSchool = await this.ensureDefaultSchool();
        if (this.isPlatformAdmin(role)) {
            return defaultSchool.id;
        }

        return defaultSchool.id;
    }

    private buildAuthPayload(user: {
        id: string;
        email: string;
        role: string;
        name: string | null;
        schoolId: string | null;
    }) {
        return {
            sub: user.id,
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name ?? user.email,
            schoolId: user.schoolId,
        };
    }

    private buildSafeUser(user: {
        id: string;
        email: string;
        role: string;
        name: string | null;
        schoolId: string | null;
    }) {
        return {
            id: user.id,
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name ?? user.email,
            schoolId: user.schoolId,
        };
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const schoolId = await this.resolveSchoolId(
            registerDto.role,
            registerDto.schoolId,
        );

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                role: registerDto.role,
                name: registerDto.name || registerDto.email.split('@')[0],
                schoolId,
            },
        });

        await this.createAuditLog({
            schoolId,
            userId: user.id,
            action: 'auth.register',
            entityType: 'user',
            entityId: user.id,
            metadata: {
                email: user.email,
                role: user.role,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const schoolId = user.schoolId ?? (await this.ensureDefaultSchool()).id;
        const payload = this.buildAuthPayload({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            schoolId,
        });
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.issueRefreshToken(user.id);

        await this.createAuditLog({
            schoolId,
            userId: user.id,
            action: 'auth.login',
            entityType: 'session',
            entityId: user.id,
            metadata: {
                email: user.email,
                role: user.role,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: this.buildSafeUser({
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                schoolId,
            }),
        };
    }

    private getRefreshSecret(): string {
        return (
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.getOrThrow<string>('JWT_SECRET')
        );
    }

    private hashRefreshToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async issueRefreshToken(userId: string): Promise<string> {
        const payload = { sub: userId, type: 'refresh' };
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.getRefreshSecret(),
            expiresIn: REFRESH_TOKEN_TTL,
        });

        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashRefreshToken(refreshToken),
                userId,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            },
        });

        return refreshToken;
    }

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        const tokenHash = this.hashRefreshToken(refreshToken);
        const existingToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });

        if (!existingToken || existingToken.revokedAt) {
            return;
        }

        await this.prisma.refreshToken.update({
            where: { tokenHash },
            data: { revokedAt: new Date() },
        });
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.getRefreshSecret(),
            });

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const tokenHash = this.hashRefreshToken(refreshToken);
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { tokenHash },
            });

            if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, role: true, name: true, schoolId: true },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            await this.prisma.refreshToken.update({
                where: { tokenHash },
                data: { revokedAt: new Date() },
            });

            const newPayload = this.buildAuthPayload({
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                schoolId: user.schoolId,
            });
            const accessToken = await this.jwtService.signAsync(newPayload);
            const nextRefreshToken = await this.issueRefreshToken(user.id);

            await this.createAuditLog({
                schoolId: user.schoolId,
                userId: user.id,
                action: 'auth.refresh',
                entityType: 'session',
                entityId: user.id,
                metadata: {
                    rotated: true,
                },
            });

            return {
                access_token: accessToken,
                refresh_token: nextRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, name: true, schoolId: true, isActive: true },
        });

        if (!user?.isActive) {
            return null;
        }

        const { isActive, ...safeUser } = user;
        return {
            ...safeUser,
            userId: safeUser.id,
        };
    }

    async assertAuthConfiguration(): Promise<void> {
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new InternalServerErrorException('JWT_SECRET is not configured');
        }
    }
}
