import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from '../../order-items/dto/create-order-item.dto';

export class CreateOrderDto {
    @IsUUID()
    @IsNotEmpty()
    tableId: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    orderNumber?: string;

    @IsEnum(['open', 'in_progress', 'ready', 'delivered', 'paid', 'cancelled'])
    @IsOptional()
    status?: 'open' | 'in_progress' | 'ready' | 'delivered' | 'paid' | 'cancelled';

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    subtotal?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    tax?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    total?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @IsOptional()
    items?: CreateOrderItemDto[];
}
