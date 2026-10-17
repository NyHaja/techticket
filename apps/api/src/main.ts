import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ValidationPipe } from '@nestjs/common';
import { REDIS_CLIENT, type RedisClient } from './redis/redis.module.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const redis = app.get<RedisClient>(REDIS_CLIENT);
  const isProd = config.get('NODE_ENV', { infer: true }) === 'production';


  app.setGlobalPrefix('api'); // toutes les routes sont définies par /api/...
  app.enableShutdownHooks();  // déclenche les hooks de déconnexion

  // Validation automatique de tous les corps de requêtes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  // Sessions stockées dans Redis
  app.use(
    session({
      name: "tt.sid",   // nom de la session
      store : new RedisStore({
        client: redis,
        prefix: "session:",
      }),
      secret: config.get('SESSION_SECRET', { infer: true }),
      resave: false,
      saveUninitialized: false,   // ne sauvegarde pas les cookies non initialisés
      rolling: true,              // conserve les sessions pendant 8 heures
      cookie: {
        httpOnly: true,
        secure: isProd,           // si production, cookie sécurisé, en local, pas sécurisé
        sameSite: 'lax',          // pour éviter les problèmes de cross-site
        maxAge: 8 * 60 * 60 * 1000, // 8 heures
      },
    }),
  );

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  console.log(`Application démarrée sur http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Echec de démarrage de l\'application', err);
  process.exit(1);
});
