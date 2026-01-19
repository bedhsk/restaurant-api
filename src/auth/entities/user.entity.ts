import { Order } from "src/orders/entities/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles as Role } from "../interfaces";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 150, unique: true })
  email: string;

  @Column('varchar', { length: 255, select: false })
  password: string;

  @Column('varchar', { array: true, default: [Role.manager] })
  roles: string[];

  // Relations
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column('bool', { default: true, name: 'is_active' })
  isActive: boolean;
}
