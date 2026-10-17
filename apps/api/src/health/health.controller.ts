import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { REDIS_CLIENT, type RedisClient } from '../redis/redis.module.js';

@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    ) {}

    @Get()
    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ok', database: 'up', "uptime": process.uptime() };
        } catch {
            throw new ServiceUnavailableException({
                status: 'error',
                database: 'down',
                message: 'Base de données inaccessible',
            });
        }
    }

    @Get('redis')
    async checkRedis() {
        try {
            // Sans délai max, ping() reste en attente tant que Redis est déconnecté
            await Promise.race([
                this.redis.ping(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
            ]);
            return { status: 'ok', redis: 'up', "uptime": process.uptime() };
        } catch {
            throw new ServiceUnavailableException({
                status: 'error',
                redis: 'down',
                message: 'Redis inaccessible',
            });
        }
    }
}

