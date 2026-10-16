import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()                       // Le module est global, donc accessible partout
@Module({
    providers: [PrismaService],     // NestJS sait le créer
    exports: [PrismaService],       // les autres modules peuvent le recevoir
})
export class PrismaModule {}

/**
 * Pourquoi un module global ?
 * Presque tous les futurs modules(tickets, auth, users, stats) auront besoin de la base de données.
 * Plutôt que d'importer <PrismaModule> dans chaque module, on importe <PrismaModule> dans le module principal.
 * Cela permet de ne pas avoir à importer <PrismaModule> dans chaque module.
 */