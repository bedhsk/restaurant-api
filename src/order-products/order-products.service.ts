import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { Repository } from 'typeorm';

import { OrdersService } from '../orders/orders.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductStatus } from './enum/order-product-status.enum';

@Injectable()
export class OrderProductsService {
  private readonly logger = new Logger(OrderProductsService.name);

  constructor(
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    private readonly ordersService: OrdersService,
  ) {}

  async findOne(id: string) {
    const orderProduct = await this.orderProductRepository.findOne({
      where: { id },
    });

    if (!orderProduct) {
      throw new NotFoundException(`Order product with id "${id}" not found`);
    }

    return orderProduct;
  }

  async update(id: string, updateOrderProductDto: UpdateOrderProductDto) {
    const orderProduct = await this.orderProductRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!orderProduct) {
      throw new NotFoundException(`Order product with id "${id}" not found`);
    }

    // Check if the order is still open
    if (orderProduct.order.closedAt) {
      throw new BadRequestException('Cannot update items in a closed order');
    }

    // If quantity is being updated, recalculate subtotal
    if (updateOrderProductDto.quantity) {
      orderProduct.quantity = updateOrderProductDto.quantity;
      orderProduct.subtotal = Number(
        (orderProduct.unitPrice * updateOrderProductDto.quantity).toFixed(2),
      );
    }

    if (updateOrderProductDto.notes !== undefined) {
      orderProduct.notes = updateOrderProductDto.notes;
    }

    if (updateOrderProductDto.status) {
      orderProduct.status = updateOrderProductDto.status;
    }

    try {
      const savedItem = await this.orderProductRepository.save(orderProduct);

      // Recalculate order totals if quantity changed
      if (updateOrderProductDto.quantity) {
        await this.ordersService.recalculateOrderTotals(orderProduct.orderId);
      }

      return savedItem;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const orderProduct = await this.orderProductRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!orderProduct) {
      throw new NotFoundException(`Order product with id "${id}" not found`);
    }

    // Check if the order is still open
    if (orderProduct.order.closedAt) {
      throw new BadRequestException('Cannot remove items from a closed order');
    }

    // Don't allow removing items that are already being prepared or served
    if (
      orderProduct.status === OrderProductStatus.PREPARING ||
      orderProduct.status === OrderProductStatus.SERVED
    ) {
      throw new BadRequestException(
        'Cannot remove items that are being prepared or already served',
      );
    }

    const orderId = orderProduct.orderId;

    await this.orderProductRepository.remove(orderProduct);

    // Recalculate order totals
    await this.ordersService.recalculateOrderTotals(orderId);

    return { message: 'Order product removed successfully' };
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException(
          'An order product with this information already exists',
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
