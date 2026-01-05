import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { TableStatus } from '../enums/table-status.enum';

@ApiTags('Tables')
@Entity('tables')
export class Table {
  @ApiProperty({
    description: 'Unique identifier for the table',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Table number or identifier',
    example: 'A-101',
    maxLength: 20,
  })
  @Column('varchar', { name: 'table_number', length: 20 })
  tableNumber: string;

  @ApiProperty({
    description: 'Maximum number of people that can sit at this table',
    example: 4,
    minimum: 1,
  })
  @Column('int')
  capacity: number;

  @ApiProperty({
    description: 'Current status of the table',
    enum: TableStatus,
    example: TableStatus.AVAILABLE,
    default: TableStatus.AVAILABLE,
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @ApiProperty({
    description: 'Whether the table is active and available for use',
    example: true,
    default: true,
  })
  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  // Relations
  @ApiProperty({
    description: 'Orders associated with this table',
    type: () => Order,
    isArray: true,
  })
  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  // Metadata
  @ApiProperty({
    description: 'Timestamp when the table was created',
    example: '2024-01-01T12:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the table was last updated',
    example: '2024-01-02T15:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
