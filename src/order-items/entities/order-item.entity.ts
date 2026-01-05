import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { Order } from "../../orders/entities/order.entity";
import { Product } from "../../products/entities/product.entity";
import { OrderItemStatus } from "../enum/order-item-status.enum";

@Entity('order_items')
export class OrderItem {
    @ApiProperty({
        description: 'Unique identifier for the order item',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Quantity of the product ordered',
        example: 2,
        minimum: 1
    })
    @Column('int')
    quantity: number;

    @ApiProperty({
        description: 'Price per unit at the time of order (snapshot from product)',
        example: 12.99
    })
    @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
    unitPrice: number;

    @ApiProperty({
        description: 'Total for this item (quantity * unitPrice)',
        example: 25.98
    })
    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;

    @ApiProperty({
        description: 'Special instructions or notes for this item',
        example: 'Extra spicy, no cilantro',
        required: false,
        nullable: true
    })
    @Column('text', { nullable: true })
    notes: string;

    @ApiProperty({
        description: 'Current status of the order item',
        enum: OrderItemStatus,
        example: OrderItemStatus.PENDING,
        default: OrderItemStatus.PENDING
    })
    @Column('varchar', { length: 50, default: OrderItemStatus.PENDING })
    status: OrderItemStatus;

    // Relations
    @ApiProperty({
        description: 'Order to which this item belongs',
        type: () => Order
    })
    @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ApiProperty({
        description: 'ID of the order to which this item belongs',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @Column('uuid', { name: 'order_id' })
    orderId: string;

    @ApiProperty({
        description: 'Product ordered',
        type: () => Product
    })
    @ManyToOne(() => Product, (product) => product.orderItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ApiProperty({
        description: 'ID of the product ordered',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @Column('uuid', { name: 'product_id' })
    productId: string;

    // Metadata
    @ApiProperty({
        description: 'Timestamp when the item was added',
        example: '2024-01-15T12:00:00Z'
    })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the item was last updated',
        example: '2024-01-15T12:30:00Z'
    })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
