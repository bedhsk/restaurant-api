import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { OrderStatus } from '../enum/order-status.enum';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Table } from '../../tables/entities/table.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique order number for display and reference',
    example: 'ORD-20240115-001',
  })
  @Column('varchar', { length: 50, unique: true, name: 'order_number' })
  orderNumber: string;

  @ApiProperty({
    description: 'Current status of the order',
    enum: OrderStatus,
    example: OrderStatus.OPEN,
    default: OrderStatus.OPEN,
  })
  @Column('varchar', { length: 50, default: OrderStatus.OPEN })
  status: OrderStatus;

  @ApiProperty({
    description: 'Sum of all order items before tax',
    example: 45.5,
  })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @ApiProperty({
    description: 'Tax amount applied to the order',
    example: 7.28,
  })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({
    description: 'Total amount including tax (subtotal + tax)',
    example: 52.78,
  })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @ApiProperty({
    description: 'Additional notes or special instructions for the order',
    example: 'No onions please',
    required: false,
    nullable: true,
  })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Timestamp when the order was closed/completed',
    example: '2024-01-15T18:30:00Z',
    required: false,
    nullable: true,
  })
  @Column('timestamp', { nullable: true, name: 'closed_at' })
  closedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Table associated with this order',
    type: () => Table,
  })
  @ManyToOne(() => Table, (table) => table.orders)
  @JoinColumn({ name: 'table_id' })
  table?: Table;

  @ApiProperty({
    description: 'ID of the table associated with this order',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @Column('uuid', { name: 'table_id', nullable: true })
  tableId?: string;

  @ApiProperty({
    description: 'User (waiter/staff) who created the order',
    type: () => User,
  })
  @ManyToOne(
    () => User,
    (user) => user.orders,
    // { eager: true }
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Items included in this order',
    type: () => OrderItem,
    isArray: true,
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  // Metadata
  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: '2024-01-15T12:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    example: '2024-01-15T12:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
