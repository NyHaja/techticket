import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
/**
 * import { AppController } from './app.controller.js';
 * import { AppService } from './app.service.js';
*/
import { validateEnv } from './config/env.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { AuthModule } from './auth/auth.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth/auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';


@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl : 60_000, limit: 100}]),   // anti-abus
    ConfigModule.forRoot({
      isGlobal: true,           // pour que les variables d'environnement soient accessibles à tous les controllers
      validate: validateEnv,    // vérifie la configuration au démarrage
    }),
    PrismaModule,              
    HealthModule,
    RedisModule,
    AuthModule,
  ],
  providers: [
    // 1. anti-abus
    {
      provide: APP_GUARD, // applicaque ce guard à tous les controllers
      useClass: ThrottlerGuard,
    },

    // 2. connecté ?
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    // 3. bon rôle ?
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
