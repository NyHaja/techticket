import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators.js';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60_000 } })       // 5 tentatives par minute et par IP
    @Post('login')
    @HttpCode(HttpStatus.OK)    // retourne un code HTTP 200 si OK
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        const user = await this.auth.validateCredentials(loginDto.email, loginDto.password);

        // Nouvel identifiant de session après connexion (anti-fixation)
        await new Promise<void>((resolve, reject) => {
            req.session.regenerate((err) => (err ? reject(err) : resolve()));
        });
        req.session.userId = user.id;
        return { user };
    }

    private destroySession(req: Request) : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            req.session.destroy((err) => (err ? reject(err) : resolve()));
        });
    }

/**
 * TODO
 * 204 : succès sans données
 * detruire la session avec req.session.destroy()
 * effacer le cookie avec res.clearCookie('tt.sid')
 * Pour recevoir res sans perdre la gestion automatique de la reponse, on peut utiliser @Res({ passthrough: true })
 */
    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)    // retourne un code HTTP 204 si OK
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.destroySession(req);
        res.clearCookie('tt.sid');
    }

/**
 * TODO
 * 401 : pas connecté
 * 
 */

    @Get('me')
    async me(@Req() req: Request) {
        const userId = req.session.userId;
        if (!userId) throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
        const user = await this.auth.findActiveUser(userId);
        if (!user) {
            await this.destroySession(req);
            throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
        }
        return { user };
    }
}