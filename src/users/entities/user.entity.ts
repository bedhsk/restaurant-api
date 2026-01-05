import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

import { Order } from "../../orders/entities/order.entity";
import { UserRole } from "../enum/user-role.enum";

@Entity('users')
export class User {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'Juan Pérez',
        maxLength: 100
    })
    @Column('varchar', { length: 100 })
    name: string;

    @ApiProperty({
        description: 'Email address of the user (unique)',
        example: 'juan.perez@restaurant.com',
        maxLength: 150
    })
    @Column('varchar', { length: 150, unique: true })
    email: string;

    @Exclude()
    @Column('varchar', { length: 255, name: 'password_hash' })
    passwordHash: string;

    @ApiProperty({
        description: 'Role of the user in the system',
        enum: UserRole,
        example: UserRole.WAITER
    })
    @Column('varchar', { length: 20, default: UserRole.WAITER })
    role: UserRole;

    @ApiProperty({
        description: 'Indicates if the user account is active',
        example: true,
        default: true
    })
    @Column('boolean', { default: true, name: 'is_active' })
    isActive: boolean;

    // Relations
    @ApiProperty({
        description: 'Orders created by this user',
        type: () => Order,
        isArray: true
    })
    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    // Metadata
    @ApiProperty({
        description: 'Timestamp when the user was created',
        example: '2024-01-01T12:00:00Z'
    })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the user was last updated',
        example: '2024-01-02T15:30:00Z'
    })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
