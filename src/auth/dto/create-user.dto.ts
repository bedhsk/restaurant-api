import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        minLength: 2,
    })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({
        description: 'User email address (must be unique)',
        example: 'john@restaurant.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)',
        example: 'Password123',
        minLength: 8,
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