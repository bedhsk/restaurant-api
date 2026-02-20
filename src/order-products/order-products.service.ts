import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrdersService } from '../orders/orders.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductStatus } from './enum/order-product-status.enum';

@Injectable()
export class OrderProductsService {
  constructor(
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    private readonly ordersService: OrdersService,
  ) { }

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

    const savedItem = await this.orderProductRepository.save(orderProduct);

    // Recalculate order totals if quantity changed
    if (updateOrderProductDto.quantity) {
      await this.ordersService.recalculateOrderTotals(orderProduct.orderId);
    }

    return savedItem;
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

}
