import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
    @ApiProperty({
        description: 'ID of the order (set internally)',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @IsUUID()
    @IsOptional()
    orderId?: string;

    @ApiProperty({
        description: 'ID of the product to order',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'Quantity of the product',
        example: 2,
        minimum: 1
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({
        description: 'Special instructions for this item',
        example: 'Extra spicy, no cilantro',
        required: false
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
