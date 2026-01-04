import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        description: 'Name of the product',
        example: 'Tacos al Pastor',
        maxLength: 255,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the product',
        example: 'Delicious tacos made with marinated pork, pineapple, and fresh cilantro.',
        required: false, nullable: true
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'URL of the product image',
        example: 'https://example.com/images/tacos-al-pastor.jpg',
        required: false, nullable: true, maximum: 500
    })
    @IsString()
    @MaxLength(500)
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({
        description: 'Price of the product',
        example: 9.99,
        minimum: 0,
        required: true,
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        description: 'Availability status of the product',
        example: true,
        required: false,
        default: true
    })
    @IsOptional()
    isAvailable?: boolean;

    @ApiProperty({
        description: 'Unique identifier for the category',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        required: true,
        uniqueItems: true
    })
    @IsUUID()
    @IsNotEmpty()
    categoryId: string;
}
