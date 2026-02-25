import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
