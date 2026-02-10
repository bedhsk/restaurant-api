import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class OrderProductInputDto {
  @ApiProperty({
    description: 'ID of the product to order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Special instructions for this item',
    example: 'No onions, extra spicy',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the table for this order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  @IsOptional()
  tableId?: string;

  @ApiProperty({
    description: 'Additional notes for the entire order',
    example: 'Birthday celebration, bring cake at the end',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'List of items to include in the order',
    type: [OrderProductInputDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderProductInputDto)
  items: OrderProductInputDto[];
}

export { OrderProductInputDto };
