import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as argon2 from 'argon2';

export const PUBLIC_USER_SELECT = { id: true, name: true, email: true,  role: true } as const;

@Injectable()
export class AuthService {
    // Cette hash est utilisée pour tester l'authentification
    private readonly dummyHash = argon2.hash('dummy-password-for-testing');

    constructor(private readonly prisma: PrismaService) {}

    async validateCredentials(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.active) {
            await argon2.verify(await this.dummyHash, password);        // test de l'authentification
            throw new UnauthorizedException('L\'adresse email et le mot de passe ne correspondent à aucun utilisateur');
        }

        const valid = await argon2.verify(user.passwordHash, password); 
        if (!valid) throw new UnauthorizedException('L\'adresse email et le mot de passe ne correspondent à aucun utilisateur');

        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    findActiveUser(id: number) {
        return this.prisma.user.findFirst({ where: { id, active: true }, select: PUBLIC_USER_SELECT });
    }
}
