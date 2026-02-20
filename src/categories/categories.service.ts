import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { CATEGORY_PAGINATION } from 'src/common/config/pagination';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const nextOrder = await this.categoryRepository
      .createQueryBuilder('category')
      .select('MAX(category.displayOrder)', 'max')
      .getRawOne();

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      displayOrder: (nextOrder?.max ?? 0) + 1,
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.categoryRepository, CATEGORY_PAGINATION);
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'description',
        'displayOrder',
        'isActive',
        'createdAt',
        'updatedAt'
      ],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async findProductsByCategory(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category.products;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return await this.categoryRepository.save(category);
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

  async validate(id: string) {
    const exists = await this.categoryRepository.existsBy({ id });

    if (!exists) {
      throw new BadRequestException(`Category with id "${id}" not found`);
    }
  }

}
