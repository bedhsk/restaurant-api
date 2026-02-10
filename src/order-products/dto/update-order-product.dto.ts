import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderProductStatus } from '../enum/order-product-status.enum';

export class UpdateOrderProductDto {
  @ApiProperty({
    description: 'Updated quantity of the product',
    example: 3,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Updated special instructions for this item',
    example: 'Changed to medium spicy',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Updated status of the order product',
    enum: OrderProductStatus,
    example: OrderProductStatus.PREPARING,
    required: false,
  })
  @IsEnum(OrderProductStatus)
  @IsOptional()
  status?: OrderProductStatus;
}
