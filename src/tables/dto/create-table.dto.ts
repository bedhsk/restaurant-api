import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TableStatus } from '../enums/table-status.enum';

export class CreateTableDto {
    @ApiProperty({
        description: 'Table number or identifier',
        example: 'A-101',
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    tableNumber: string;

    @ApiProperty({
        description: 'Maximum number of people that can sit at this table',
        example: 4,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    capacity: number;

    @ApiProperty({
        description: 'Current status of the table',
        enum: TableStatus,
        example: TableStatus.AVAILABLE,
        required: false,
        default: TableStatus.AVAILABLE,
    })
    @IsEnum(TableStatus, {
        message: `status must be one of: ${Object.values(TableStatus).join(', ')}`,
    })
    @IsOptional()
    status?: TableStatus;

    @ApiProperty({
        description: 'Whether the table is active and available for use',
        example: true,
        required: false,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
