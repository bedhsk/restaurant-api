import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Additional notes for the order',
    example: 'Customer requested bill split',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
