import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        { provide: APP_GUARD, useClass: AuthGuard },    // 1. connecté ?
        { provide: APP_GUARD, useClass: RolesGuard },   // 2. bon rôle ?
    ],
    exports: [AuthService],
})
export class AuthModule {}
