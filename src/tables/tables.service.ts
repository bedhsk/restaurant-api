import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';

import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

import { TABLE_PAGINATION } from 'src/common/config/pagination';
import { Table } from './entities/table.entity';
import { TableStatus } from './enums/table-status.enum';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) { }

  async create(createTableDto: CreateTableDto) {
    const table = this.tableRepository.create(createTableDto);
    return await this.tableRepository.save(table);
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.tableRepository, TABLE_PAGINATION);
  }

  async findOne(id: string) {
    const table = await this.tableRepository.findOne({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException(`Table with id "${id}" not found`);
    }

    return table;
  }

  async validateAvailable(id: string): Promise<Table> {
    const table = await this.findOne(id);

    if (table.status !== TableStatus.AVAILABLE) {
      throw new BadRequestException(
        'Table is not available, please check table status',
      );
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.tableRepository.preload({
      id,
      ...updateTableDto,
    });

    if (!table) {
      throw new NotFoundException(`Table with id "${id}" not found`);
    }

    return await this.tableRepository.save(table);
  }

  async remove(id: string) {
    const table = await this.tableRepository.findOne({ where: { id } });

    if (!table) {
      throw new NotFoundException(`Table with id "${id}" not found`);
    }

    return this.tableRepository.remove(table);
  }

}
