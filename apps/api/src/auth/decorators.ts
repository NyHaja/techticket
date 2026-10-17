import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from '../generated/prisma/client.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// La route est accessible sans être connecté
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// La route est réservée à ces rôles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Injecte l'utilisateur connecté das une paramètre du contrôlleur
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<Request>().user,
);