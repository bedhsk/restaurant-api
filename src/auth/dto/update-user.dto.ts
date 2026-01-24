import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { ValidRoles } from '../interfaces';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'john@restaurant.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User roles for authorization',
    example: ['manager'],
    enum: ValidRoles,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  roles?: ValidRoles[];
}
