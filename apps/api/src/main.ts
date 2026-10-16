import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });

  app.setGlobalPrefix('api'); // toutes les routes sont définies par /api/...
  app.enableShutdownHooks();  // déclenche les hooks de déconnexion

  await app.listen(port);
  console.log(`Application démarrée sur http://localhost:${port}`);
}
bootstrap();
