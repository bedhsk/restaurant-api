import { FilterOperator, FilterSuffix, PaginateConfig } from 'nestjs-paginate';
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

  filterableColumns: {
    isAvailable: [FilterOperator.EQ],
    'category.id': [FilterOperator.EQ, FilterOperator.IN],
    'category.name': [
      FilterOperator.EQ,
      FilterOperator.ILIKE,
      FilterSuffix.NOT,
    ],
  },

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
