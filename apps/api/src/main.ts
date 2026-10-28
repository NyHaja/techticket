import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ValidationPipe } from '@nestjs/common';
import { REDIS_CLIENT, type RedisClient } from './redis/redis.module.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  // En production, le navigateur parle en HTTPS au reverse proxy, qui parle ensuite en HTTP à l'API.
  // Sans cette config, l'API croit la connexion non sécurisée et refuse d'envoyer le cookie "secure".
  // On fait confiance à un seul niveau de proxy (le nôtre), et uniquement en production :
  // en local, il n'y a pas de proxy et un client pourrait falsifier l'en-tête X-Forwarded-For.
  if (isProd) {
    app.set('trust proxy', 1);
  }

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
