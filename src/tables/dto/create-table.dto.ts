import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTableDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    tableNumber: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    capacity: number;

    @IsEnum(['available', 'occupied', 'reserved', 'maintenance'])
    @IsOptional()
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance';

    @IsOptional()
    isActive?: boolean;
}
