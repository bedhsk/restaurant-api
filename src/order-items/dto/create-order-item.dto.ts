import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
    @IsUUID()
    @IsOptional()
    orderId?: string;

    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    unitPrice?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    subtotal?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsEnum(['pending', 'preparing', 'served', 'cancelled'])
    @IsOptional()
    status?: 'pending' | 'preparing' | 'served' | 'cancelled';
}
