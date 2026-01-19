import { ApiProperty } from "@nestjs/swagger";
import { Order } from "src/orders/entities/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles as Role } from "../interfaces";

/**
 * User Entity
 * Represents a system user (staff member) who can authenticate and perform actions.
 * Users can have different roles: admin, manager, waiter, cashier.
 */
@Entity('users')
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    maxLength: 100,
  })
  @Column('varchar', { length: 100 })
  name: string;

  @ApiProperty({
    description: 'Email address used for authentication (unique)',
    example: 'john.doe@restaurant.com',
    maxLength: 150,
  })
  @Column('varchar', { length: 150, unique: true })
  email: string;

  @ApiProperty({
    description: 'Hashed password (never exposed in responses)',
    writeOnly: true,
  })
  @Column('varchar', { length: 255, select: false })
  password: string;

  @ApiProperty({
    description: 'User roles for authorization',
    example: ['manager'],
    enum: Role,
    isArray: true,
    default: [Role.manager],
  })
  @Column('varchar', { array: true, default: [Role.manager] })
  roles: string[];

  @ApiProperty({
    description: 'Token version for JWT invalidation (incremented on logout)',
    example: 0,
    default: 0,
  })
  @Column({ default: 0 })
  tokenVersion: number;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @Column('bool', { default: true, name: 'is_active' })
  isActive: boolean;

  // Relations
  @ApiProperty({
    description: 'Orders created by this user',
    type: () => Order,
    isArray: true,
  })
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
