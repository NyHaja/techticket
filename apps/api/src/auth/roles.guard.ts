import {
    ForbiddenException,
    Injectable,
    type CanActivate,
    type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '../generated/prisma/client.js';
import { ROLES_KEY } from './decorators.js';

// S'exécute après AuthGuard, qui a déjà attaché req.user
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // 1. Pas de @Roles() -> tout utilisateur connecté passe
        const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
            context.getHandler(),     // pour les handlers
            context.getClass()        // pour les controllers
        ]);
        if (!roles || roles.length === 0) return true;

        // 2. Rôle absent de la liste -> 403
        const user = context.switchToHttp().getRequest<Request>().user;
        if (!user || !roles.includes(user.role)) {
            throw new ForbiddenException('Vous n\'avez pas les droits pour accéder à cette ressource');
        }
        return true;
    }
}
