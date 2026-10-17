import {
    Injectable,
    UnauthorizedException,
    type CanActivate,
    type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { IS_PUBLIC_KEY } from './decorators.js';
import { destroySession } from './session.utils.js';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly auth: AuthService, 
        private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext) : Promise<boolean> {
        // 1. Route marquée @Public() ->on laisse passer
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),     // pour les handlers
            context.getClass()        // pour les controllers
        ]);
        if (isPublic) return true;

        // Pas de session -> 401
        const req = context.switchToHttp().getRequest<Request>();
        const userId = req.session?.userId;
        if (!userId) throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');

        // 3. Utilisateur supprimé ou désactivé -> on detruit la sessions, 401
        const user = await this.auth.findActiveUser(userId);
        if (!user) {
            await destroySession(req);
            throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
        }

        // 4. ON attache l'utilisateur à la requête pour la suite
        req.user = user;
        return true;
    }
}