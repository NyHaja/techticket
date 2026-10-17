import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'L\'adresse email est invalide' })
    email!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(200)
    password: string;
}
    