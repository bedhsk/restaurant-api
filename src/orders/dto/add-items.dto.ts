import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { OrderItemInputDto } from './create-order.dto';

export class AddItemsDto {
    @ApiProperty({
        description: 'List of items to add to the existing order',
        type: [OrderItemInputDto],
        minItems: 1
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemInputDto)
    items: OrderItemInputDto[];
}