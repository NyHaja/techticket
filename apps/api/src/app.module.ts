import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           // pour que les variables d'environnement soient accessibles à tous les controllers
      validate: validateEnv,    // vérifie la configuration au démarrage
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
