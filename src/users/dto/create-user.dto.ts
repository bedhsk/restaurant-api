import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(255)
    password: string;

    @IsEnum(['admin', 'manager', 'waiter', 'cashier'])
    @IsNotEmpty()
    role: 'admin' | 'manager' | 'waiter' | 'cashier';

    @IsOptional()
    isActive?: boolean;
}
