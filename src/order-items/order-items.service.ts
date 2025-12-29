import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) { }

  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      const orderItem = this.orderItemsRepository.create(createOrderItemDto);
      return await this.orderItemsRepository.save(orderItem);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating order item');
    }
  }

  findAll() {
    return `This action returns all orderItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
