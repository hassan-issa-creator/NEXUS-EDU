import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Request,
    Res,
    Req,
    UnauthorizedException,
    Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { Role } from '../../../shared/enums/roles.enum';
import { AccountLockGuard } from '../guards/account-lock.guard';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @UseGuards(AccountLockGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const isProduction = process.env.NODE_ENV === 'production';
        try {
            console.log(`🔐 [AuthController] Login attempt: ${loginDto.email}`);
            const result = await this.authService.login(loginDto);

            // Reset lock count on success
            await this.cacheManager.del(`lockout:${loginDto.email}`);

            // Set refresh token in http-only cookie.
            // IMPORTANT: sameSite must be 'none' in production so the browser
            // sends it across origins (frontend ≠ backend on Railway).
            // 'strict' silently blocks cross-origin cookies.
            res.cookie('refresh_token', result.refresh_token, {
                httpOnly: true,
                secure: isProduction,                        // HTTPS only in prod
                sameSite: isProduction ? 'none' : 'lax',   // cross-origin in prod
                path: '/',
            });

            console.log(`✅ [AuthController] Login success: ${loginDto.email}`);

            // Don't send refresh token in response body
            const { refresh_token, ...responseData } = result;
            return responseData;
        } catch (error) {
            console.error(`❌ [AuthController] Login failed for ${loginDto.email}:`, (error as any)?.message);
            if (error instanceof UnauthorizedException) {
                const key = `lockout:${loginDto.email}`;
                const attempts = (await this.cacheManager.get<number>(key)) || 0;
                await this.cacheManager.set(key, attempts + 1, 15 * 60 * 1000); // 15 mins TTL
            }
            throw error;
        }
    }

    @Post('refresh')
    async refresh(
        @Req() req: ExpressRequest,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const result = await this.authService.refreshAccessToken(refreshToken);
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        });

        const { refresh_token, ...responseData } = result;
        return responseData;
    }

    @Post('logout')
    async logout(
        @Req() req: ExpressRequest,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }

        const isProduction = process.env.NODE_ENV === 'production';
        // Clear refresh token cookie with correct attributes
        res.clearCookie('refresh_token', { 
            path: '/',
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        return { message: 'Logged out successfully' };
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req: any) {
        return req.user;
    }

    @Get('admin-only')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    adminOnly(@Request() req: any) {
        return { message: 'Admin access granted', user: req.user };
    }
}
