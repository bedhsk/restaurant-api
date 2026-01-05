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

import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    required: true,
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Tacos al Pastor',
    maxLength: 255,
    required: true,
  })
  @Column('varchar', { length: 255 })
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example:
      'Delicious tacos made with marinated pork, pineapple, and fresh cilantro.',
    required: false,
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    description: 'URL of the product image',
    example: 'https://example.com/images/tacos-al-pastor.jpg',
    required: false,
    nullable: true,
    maximum: 500,
  })
  @Column('varchar', { length: 500, nullable: true, name: 'image_url' })
  imageUrl: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 9.99,
    minimum: 0,
    required: true,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Availability status of the product',
    example: true,
    required: false,
    default: true,
  })
  @Column('boolean', { default: true, name: 'is_available' })
  isAvailable: boolean;

  // Relations
  @ApiProperty({
    description: 'Category to which the product belongs',
    example: {
      id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      name: 'Main Course',
    },
    required: true,
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  // Metadata
  @ApiProperty({
    description: 'Timestamp when the product was created',
    example: '2024-01-01T12:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the product was last updated',
    example: '2024-01-02T15:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
