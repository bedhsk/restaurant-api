import { PaginateConfig } from 'nestjs-paginate';
import { Product } from '../entities/product.entity';

export const PRODUCT_PAGINATION_CONFIG: PaginateConfig<Product> = {
  sortableColumns: [
    'name',
    'price',
    'isAvailable',
    'createdAt',
    'category.name',
  ],

  defaultSortBy: [['createdAt', 'DESC']],

  searchableColumns: ['name', 'category.name'],

  relations: ['category'],

  select: [
    'id',
    'name',
    'description',
    'price',
    'imageUrl',
    'isAvailable',
    'createdAt',
    'category.id',
    'category.name',
  ],

  defaultLimit: 20,
  maxLimit: 50,
  relativePath: true,
};
