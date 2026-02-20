import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { In, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { CategoriesService } from 'src/categories/categories.service';
import { PRODUCT_PAGINATION } from 'src/common/config/pagination';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly categoriesService: CategoriesService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    await this.categoriesService.validate(createProductDto.categoryId);

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.productRepository, PRODUCT_PAGINATION);
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
      await this.categoriesService.validate(updateProductDto.categoryId);
    }

    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return await this.productRepository.save(product);
  }

  async validate(productIds: string[]): Promise<Map<string, Product>> {
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Products not found: ${missingIds.join(', ')}`,
      );
    }

    const unavailable = products.filter((p) => !p.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Products not available: ${unavailable.map((p) => p.name).join(', ')}`,
      );
    }

    return new Map(products.map((p) => [p.id, p]));
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return this.productRepository.remove(product);
  }

}
