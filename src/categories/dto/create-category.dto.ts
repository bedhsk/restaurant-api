import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Name of the category',
        example: 'Main Courses',
        maxLength: 100,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Detailed description of the category',
        example: 'Traditional main courses including tacos, burritos, and enchiladas',
        required: false,
        nullable: true
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Display order for sorting categories in the UI',
        example: 1,
        minimum: 0,
        required: false,
        default: 0
    })
    @IsInt()
    @Min(0)
    @IsOptional()
    displayOrder?: number;

    @ApiProperty({
        description: 'Indicates if the category is active and visible',
        example: true,
        required: false,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
