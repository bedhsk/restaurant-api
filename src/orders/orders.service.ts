import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { DatabaseError } from 'pg';
import { DataSource, Repository } from 'typeorm';

import { OrderProduct } from '../order-products/entities/order-product.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from './entities/order.entity';

import { AddItemsDto } from './dto/add-items.dto';
import { CreateOrderDto, OrderProductInputDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { User } from 'src/auth/entities/user.entity';
import { ORDER_PAGINATION } from 'src/common/config/pagination';
import { ProductsService } from 'src/products/products.service';
import { TableStatus } from 'src/tables/enums/table-status.enum';
import { TablesService } from 'src/tables/tables.service';
import { OrderStatus } from './enum/order-status.enum';

const TAX_RATE = 0.12; // 12% IVA

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly productsService: ProductsService,
    private readonly tablesService: TablesService,

    private readonly dataSource: DataSource,
  ) { }

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { tableId, notes, items } = createOrderDto;

    // Validate table exists and is available
    if (tableId) {
      await this.tablesService.validateAvailable(tableId);
    }

    // Validate products and get their prices
    const productIds = items.map((item) => item.productId);
    const products = await this.productsService.validate(productIds);

    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Calculate order products with prices
      const orderProductsData = this.calculateOrderProducts(items, products);
      const subtotal = orderProductsData.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const tax = Number((subtotal * TAX_RATE).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      // Create order
      const order = manager.create(Order, {
        orderNumber,
        tableId,
        user,
        notes,
        subtotal,
        tax,
        total,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await manager.save(Order, order);

      // Create order products
      const orderProducts = orderProductsData.map((itemData) =>
        manager.create(OrderProduct, {
          ...itemData,
          orderId: savedOrder.id,
        }),
      );

      await manager.save(OrderProduct, orderProducts);

      if (tableId) {
        await this.tablesService.update(tableId, { status: TableStatus.OCCUPIED });
      }

      // Use manager to query within transaction context
      return {
        id: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        message: 'Order created successfully',
      };
    });
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.orderRepository, ORDER_PAGINATION);
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderProducts', 'orderProducts.product', 'table', 'user'],
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
      relations: ['orderProducts'],
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
    const products = await this.productsService.validate(productIds);

    return this.dataSource.transaction(async (manager) => {
      // Calculate new products
      const newProductsData = this.calculateOrderProducts(
        addItemsDto.items,
        products,
      );

      // Create order products
      const newProducts = newProductsData.map((itemData) =>
        manager.create(OrderProduct, {
          ...itemData,
          orderId: order.id,
        }),
      );

      await manager.save(OrderProduct, newProducts);

      // Recalculate order totals
      const allItems = await manager.find(OrderProduct, {
        where: { orderId: id },
      });
      const subtotal = allItems.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0,
      );
      const tax = Number((subtotal * TAX_RATE).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      await manager.update(Order, id, { subtotal, tax, total });

      // Use manager to query within transaction context
      return manager.findOne(Order, {
        where: { id },
        relations: ['orderProducts', 'orderProducts.product', 'table', 'user'],
      });
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
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts'],
    });

    if (!order) return;

    const subtotal = order.orderProducts.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    await this.orderRepository.update(orderId, { subtotal, tax, total });
  }

  private calculateOrderProducts(
    items: OrderProductInputDto[],
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
