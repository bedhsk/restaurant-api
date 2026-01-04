import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

import { Product } from './entities/product.entity';
import { PRODUCT_PAGINATION_CONFIG } from './config/product-pagination.config';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const createProduct = {
        ...createProductDto,
        category: { id: createProductDto.categoryId }
      };
      const product = this.productRepository.create(createProduct);
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(query: PaginateQuery) {
    return paginate(query, this.productRepository, PRODUCT_PAGINATION_CONFIG);
  }

  async findOne(id: string) {
    const queryBuilder = this.productRepository.createQueryBuilder();
    const product = await queryBuilder
      .where('Product.id = :id', { id })
      .leftJoinAndSelect('Product.category', 'category')
      .select([
        'Product.id',
        'Product.name',
        'Product.description',
        'Product.imageUrl',
        'Product.price',
        'Product.isAvailable',
        'Product.createdAt',
        'Product.updatedAt',
        'category.id',
        'category.name'
      ])
      .getOne();

    if (!product)
      throw new NotFoundException(`Product with id "${id}" not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    })

    if (!product)
      throw new BadRequestException(`Product with id "${id}" not found`);

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      return this.productRepository.remove(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505')
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
