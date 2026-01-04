import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

import { UpdateTableDto } from './dto/update-table.dto';
import { CreateTableDto } from './dto/create-table.dto';

import { Table } from './entities/table.entity';
import { TABLE_PAGINATION_CONFIG } from './config/table-pagination.config';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto) {
    try {
      const table = this.tableRepository.create(createTableDto);
      return await this.tableRepository.save(table);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.tableRepository, TABLE_PAGINATION_CONFIG);
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

  async update(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.tableRepository.preload({
      id,
      ...updateTableDto,
    });

    if (!table) {
      throw new NotFoundException(`Table with id "${id}" not found`);
    }

    try {
      return await this.tableRepository.save(table);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const table = await this.tableRepository.findOne({ where: { id } });

    if (!table) {
      throw new NotFoundException(`Table with id "${id}" not found`);
    }

    return this.tableRepository.remove(table);
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException(
          'A table with this information already exists',
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