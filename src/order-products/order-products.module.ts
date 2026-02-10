import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderProductsService } from './order-products.service';
import { OrderProductsController } from './order-products.controller';
import { OrderProduct } from './entities/order-product.entity';

import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderProduct]),
    OrdersModule,
  ],
  controllers: [OrderProductsController],
  providers: [OrderProductsService],
  exports: [OrderProductsService],
})
export class OrderProductsModule {}
