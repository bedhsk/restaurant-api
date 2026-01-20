import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    required: true,
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Main Courses',
    maxLength: 100,
    required: true,
  })
  @Column('varchar', { length: 100 })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the category',
    example:
      'Traditional main courses including tacos, burritos, and enchiladas',
    required: false,
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    description: 'Display order for sorting categories in the UI',
    example: 1,
    minimum: 0,
    required: false,
  })
  @Column('int', { name: 'display_order', unique: true })
  displayOrder: number;

  @ApiProperty({
    description: 'Indicates if the category is active and visible',
    example: true,
    required: false,
    default: true,
  })
  @Column('boolean', { default: true, name: 'is_active' })
  isActive: boolean;

  // Relations
  @ApiProperty({
    description: 'Products that belong to this category',
    type: () => Product,
    isArray: true,
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // Metadata
  @ApiProperty({
    description: 'Timestamp when the category was created',
    example: '2024-01-01T12:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the category was last updated',
    example: '2024-01-02T15:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
