import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { PRODUCT_PAGINATION_CONFIG } from './config/product-pagination.config';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    await this.validateCategoryExists(createProductDto.categoryId);

    try {
      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.productRepository, PRODUCT_PAGINATION_CONFIG);
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        isAvailable: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          id: true,
          name: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto.categoryId) {
      await this.validateCategoryExists(updateProductDto.categoryId);
    }

    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return this.productRepository.remove(product);
  }

  private async validateCategoryExists(categoryId: string): Promise<void> {
    const categoryExists = await this.categoryRepository.existsBy({
      id: categoryId,
    });

    if (!categoryExists) {
      throw new BadRequestException(
        `Category with id "${categoryId}" not found`,
      );
    }
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string; detail?: string };

      if (driverError.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${driverError.detail}`);
        throw new BadRequestException(
          'A product with this information already exists',
        );
      }

      if (driverError.code === '23503') {
        this.logger.error(`Foreign key violation: ${driverError.detail}`);
        throw new BadRequestException('Invalid category reference');
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
