import { PaginateConfig } from 'nestjs-paginate';
import { Product } from 'src/products/entities/product.entity';

export const PRODUCT_PAGINATION: PaginateConfig<Product> = {
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
