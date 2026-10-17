import { Controller, Get } from '@nestjs/common';
import { CurrentUser, Roles } from '../auth/decorators.js';
import { UsersService } from './users.service.js';

// Administrateurs uniquement
@Roles('ADMIN')
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @Get()
    findAll() {
        return this.users.findAll();
    }
}
