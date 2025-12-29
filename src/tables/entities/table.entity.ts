import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 20, name: 'table_number' })
    tableNumber: string;

    @Column('int')
    capacity: number;

    @Column('varchar', { length: 50, default: 'available' })
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';

    @Column('boolean', { default: true, name: 'is_active' })
    isActive: boolean;

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
