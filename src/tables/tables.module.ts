import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Table } from './entities/table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table]),
  ],
  controllers: [TablesController],
  providers: [TablesService, Order],
})
export class TablesModule { }
