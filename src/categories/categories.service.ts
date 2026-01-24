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

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Category } from './entities/category.entity';
import { CATEGORY_PAGINATION } from 'src/common/config/pagination';

interface MaxOrderResult {
  max: number | null;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const nextOrder = await this.categoryRepository
        .createQueryBuilder('category')
        .select('MAX(category.displayOrder)', 'max')
        .getRawOne<MaxOrderResult>();

      const category = this.categoryRepository.create({
        ...createCategoryDto,
        displayOrder: (nextOrder?.max ?? 0) + 1,
      });
      return await this.categoryRepository.save(category);
    } catch (error: unknown) {
      this.handleExceptions(error);
    }
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.categoryRepository, CATEGORY_PAGINATION);
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    const deletedOrder = category.displayOrder;
    await this.categoryRepository.remove(category);

    // Reordenar las categorías con displayOrder mayor
    await this.categoryRepository
      .createQueryBuilder()
      .update(Category)
      .set({ displayOrder: () => 'display_order - 1' })
      .where('display_order > :deletedOrder', { deletedOrder })
      .execute();

    return category;
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException(
          'A category with this information already exists',
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
