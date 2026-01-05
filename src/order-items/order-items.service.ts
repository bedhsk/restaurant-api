import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseError } from 'pg';

import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderItemStatus } from './enum/order-item-status.enum';

@Injectable()
export class OrderItemsService {
  private readonly logger = new Logger(OrderItemsService.name);

  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async findOne(id: string) {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['product'],
      select: {
        id: true,
        quantity: true,
        unitPrice: true,
        subtotal: true,
        notes: true,
        status: true,
        orderId: true,
        productId: true,
        createdAt: true,
        updatedAt: true,
        product: { id: true, name: true, imageUrl: true },
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with id "${id}" not found`);
    }

    return orderItem;
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with id "${id}" not found`);
    }

    // Check if the order is still open
    if (orderItem.order.closedAt) {
      throw new BadRequestException('Cannot update items in a closed order');
    }

    // If quantity is being updated, recalculate subtotal
    if (updateOrderItemDto.quantity) {
      orderItem.quantity = updateOrderItemDto.quantity;
      orderItem.subtotal = Number(
        (orderItem.unitPrice * updateOrderItemDto.quantity).toFixed(2),
      );
    }

    if (updateOrderItemDto.notes !== undefined) {
      orderItem.notes = updateOrderItemDto.notes;
    }

    if (updateOrderItemDto.status) {
      orderItem.status = updateOrderItemDto.status;
    }

    try {
      const savedItem = await this.orderItemRepository.save(orderItem);

      // Recalculate order totals if quantity changed
      if (updateOrderItemDto.quantity) {
        await this.ordersService.recalculateOrderTotals(orderItem.orderId);
      }

      return savedItem;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with id "${id}" not found`);
    }

    // Check if the order is still open
    if (orderItem.order.closedAt) {
      throw new BadRequestException('Cannot remove items from a closed order');
    }

    // Don't allow removing items that are already being prepared or served
    if (
      orderItem.status === OrderItemStatus.PREPARING ||
      orderItem.status === OrderItemStatus.SERVED
    ) {
      throw new BadRequestException(
        'Cannot remove items that are being prepared or already served',
      );
    }

    const orderId = orderItem.orderId;

    await this.orderItemRepository.remove(orderItem);

    // Recalculate order totals
    await this.ordersService.recalculateOrderTotals(orderId);

    return { message: 'Order item removed successfully' };
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException(
          'An order item with this information already exists',
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
