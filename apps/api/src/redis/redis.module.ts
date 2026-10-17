import { Global, Inject, Module, OnModuleDestroy} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import type { Env } from '../config/env.js';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
export type RedisClient = ReturnType<typeof createClient>;

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: async (config: ConfigService<Env, true>) => {
                const client = createClient({
                    url: config.get('REDIS_URL', { infer: true }),
                });
                client.on('error', (err:Error) => console.error('Redis : ', err.message));
                await client.connect();
                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
    constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {}

    async onModuleDestroy() {
        await this.client.disconnect();     // fermeture propre à l'arrêt du serveur
    }
}