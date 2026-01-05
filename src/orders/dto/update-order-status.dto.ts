import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderStatusDto {
    @ApiProperty({
        description: 'New status for the order',
        enum: OrderStatus,
        example: OrderStatus.IN_PROGRESS
    })
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}