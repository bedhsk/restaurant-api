import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { DatabaseError } from 'pg';
import { paginate, PaginateQuery } from 'nestjs-paginate';

import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Table } from '../tables/entities/table.entity';
import { User } from '../users/entities/user.entity';

import { CreateOrderDto, OrderItemInputDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddItemsDto } from './dto/add-items.dto';

import { OrderStatus } from './enum/order-status.enum';
import { ORDER_PAGINATION_CONFIG } from './config/order-pagination.config';

const TAX_RATE = 0.16; // 16% IVA

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tableId, userId, notes, items } = createOrderDto;

    // Validate table and user exist
    await this.validateTableExists(tableId);
    await this.validateUserExists(userId);

    // Validate products and get their prices
    const productIds = items.map((item) => item.productId);
    const products = await this.validateProductsExist(productIds);

    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Calculate order items with prices
      const orderItemsData = this.calculateOrderItems(items, products);
      const subtotal = orderItemsData.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const tax = Number((subtotal * TAX_RATE).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      // Create order
      const order = manager.create(Order, {
        orderNumber,
        tableId,
        userId,
        notes,
        subtotal,
        tax,
        total,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await manager.save(Order, order);

      // Create order items
      const orderItems = orderItemsData.map((itemData) =>
        manager.create(OrderItem, {
          ...itemData,
          orderId: savedOrder.id,
        }),
      );

      await manager.save(OrderItem, orderItems);

      return this.findOne(savedOrder.id);
    });
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.orderRepository, ORDER_PAGINATION_CONFIG);
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'table', 'user'],
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        tax: true,
        total: true,
        notes: true,
        closedAt: true,
        tableId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        table: { id: true, tableNumber: true },
        user: { id: true, name: true },
        orderItems: {
          id: true,
          quantity: true,
          unitPrice: true,
          subtotal: true,
          notes: true,
          status: true,
          productId: true,
          product: { id: true, name: true, imageUrl: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.preload({
      id,
      ...updateOrderDto,
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    try {
      return await this.orderRepository.save(order);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    order.status = updateStatusDto.status;

    // Set closedAt timestamp when order is paid or cancelled
    if (
      updateStatusDto.status === OrderStatus.PAID ||
      updateStatusDto.status === OrderStatus.CANCELLED
    ) {
      order.closedAt = new Date();
    }

    try {
      return await this.orderRepository.save(order);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async addItems(id: string, addItemsDto: AddItemsDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot add items to a closed order');
    }

    // Validate products
    const productIds = addItemsDto.items.map((item) => item.productId);
    const products = await this.validateProductsExist(productIds);

    return this.dataSource.transaction(async (manager) => {
      // Calculate new items
      const newItemsData = this.calculateOrderItems(
        addItemsDto.items,
        products,
      );

      // Create order items
      const newItems = newItemsData.map((itemData) =>
        manager.create(OrderItem, {
          ...itemData,
          orderId: order.id,
        }),
      );

      await manager.save(OrderItem, newItems);

      // Recalculate order totals
      const allItems = await manager.find(OrderItem, {
        where: { orderId: id },
      });
      const subtotal = allItems.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0,
      );
      const tax = Number((subtotal * TAX_RATE).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      await manager.update(Order, id, { subtotal, tax, total });

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return this.orderRepository.remove(order);
  }

  async recalculateOrderTotals(orderId: string): Promise<void> {
    const items = await this.orderItemRepository.find({ where: { orderId } });
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    await this.orderRepository.update(orderId, { subtotal, tax, total });
  }

  private calculateOrderItems(
    items: OrderItemInputDto[],
    products: Map<string, Product>,
  ): Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }> {
    return items.map((item) => {
      const product = products.get(item.productId)!;
      const unitPrice = Number(product.price);
      const subtotal = Number((unitPrice * item.quantity).toFixed(2));

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        notes: item.notes,
      };
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderNumber LIKE :pattern', { pattern: `ORD-${dateStr}-%` })
      .orderBy('order.orderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  private async validateTableExists(tableId: string): Promise<void> {
    const exists = await this.tableRepository.existsBy({ id: tableId });
    if (!exists) {
      throw new BadRequestException(`Table with id "${tableId}" not found`);
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const exists = await this.userRepository.existsBy({ id: userId });
    if (!exists) {
      throw new BadRequestException(`User with id "${userId}" not found`);
    }
  }

  private async validateProductsExist(
    productIds: string[],
  ): Promise<Map<string, Product>> {
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Products not found: ${missingIds.join(', ')}`,
      );
    }

    const unavailable = products.filter((p) => !p.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Products not available: ${unavailable.map((p) => p.name).join(', ')}`,
      );
    }

    return new Map(products.map((p) => [p.id, p]));
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException(
          'An order with this information already exists',
        );
      }

      if (error.code === '23503') {
        this.logger.error(`Foreign key violation: ${error.detail}`);
        throw new BadRequestException('Invalid reference');
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
