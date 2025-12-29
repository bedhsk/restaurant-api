import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    displayOrder?: number;

    @IsOptional()
    isActive?: boolean;
}
