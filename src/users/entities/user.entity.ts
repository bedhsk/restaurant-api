import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 100 })
    name: string;

    @Column('varchar', { length: 150, unique: true })
    email: string;

    @Column('varchar', { length: 255, name: 'password_hash' })
    passwordHash: string;

    @Column('varchar', { length: 20 })
    role: 'admin' | 'manager' | 'waiter' | 'cashier';

    @Column('boolean', { default: true, name: 'is_active' })
    isActive: boolean;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
