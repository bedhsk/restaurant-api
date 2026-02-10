import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderItemStatus } from '../enum/order-item-status.enum';

export class UpdateOrderItemDto {
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
    description: 'Updated status of the order item',
    enum: OrderItemStatus,
    example: OrderItemStatus.PREPARING,
    required: false,
  })
  @IsEnum(OrderItemStatus)
  @IsOptional()
  status?: OrderItemStatus;
}
