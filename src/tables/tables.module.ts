import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TablesController],
  providers: [TablesService],
  imports: [
    TypeOrmModule.forFeature([Table]),
    AuthModule
  ],
  exports: [TablesService],
})
export class TablesModule { }
