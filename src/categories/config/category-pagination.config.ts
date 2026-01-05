import { PaginateConfig } from 'nestjs-paginate';
import { Category } from '../entities/category.entity';

export const CATEGORY_PAGINATION_CONFIG: PaginateConfig<Category> = {
  sortableColumns: ['name', 'displayOrder', 'isActive', 'createdAt'],

  defaultSortBy: [
    ['displayOrder', 'ASC'],
    ['name', 'ASC'],
  ],

  searchableColumns: ['name', 'description'],

  defaultLimit: 20,
  maxLimit: 50,
  relativePath: true,
};
