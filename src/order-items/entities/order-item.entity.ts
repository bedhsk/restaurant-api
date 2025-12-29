import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
    unitPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;

    @Column('text', { nullable: true })
    notes: string;

    @Column('varchar', { length: 50, default: 'pending' })
    status: 'pending' | 'preparing' | 'served' | 'cancelled';

    @ManyToOne(() => Order, (order) => order.orderItems)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
