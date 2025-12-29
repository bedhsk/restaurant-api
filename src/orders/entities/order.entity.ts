import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Table } from "../../tables/entities/table.entity";
import { User } from "../../users/entities/user.entity";
import { OrderItem } from "../../order-items/entities/order-item.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 50, unique: true, name: 'order_number' })
    orderNumber: string;

    @Column('varchar', { length: 50, default: 'open' })
    status: 'open' | 'in_progress' | 'ready' | 'delivered' | 'paid' | 'cancelled';

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    tax: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    total: number;

    @Column('text', { nullable: true })
    notes: string;

    @Column('timestamp', { nullable: true, name: 'closed_at' })
    closedAt: Date;

    @ManyToOne(() => Table, (table) => table.orders)
    @JoinColumn({ name: 'table_id' })
    table: Table;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    orderItems: OrderItem[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
