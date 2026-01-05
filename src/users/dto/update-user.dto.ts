import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enum/user-role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Juan Pérez García',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'juan.perez@restaurant.com',
    maxLength: 150,
    required: false,
  })
  @IsEmail()
  @MaxLength(150)
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'New password for the user account',
    example: 'NewSecurePass456!',
    minLength: 8,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: UserRole.MANAGER,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
