import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Juan Pérez',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address of the user (must be unique)',
    example: 'juan.perez@restaurant.com',
    maxLength: 150,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @ApiProperty({
    description: 'Password for the user account (min 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: UserRole.WAITER,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
