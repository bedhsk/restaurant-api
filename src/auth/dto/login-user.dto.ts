import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class LoginUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john@restaurant.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123',
    })
    @IsStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 0
    })
    password: string;
}