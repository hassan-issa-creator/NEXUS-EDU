import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountLockGuard } from './guards/account-lock.guard';
import { getJwtSecret } from '../../config/jwt';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || getJwtSecret(),
                signOptions: { expiresIn: '15m' }, // Access token: 15 minutes
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, AccountLockGuard],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
