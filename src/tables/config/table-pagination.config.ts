import { PaginateConfig } from 'nestjs-paginate';
import { Table } from '../entities/table.entity';

export const TABLE_PAGINATION_CONFIG: PaginateConfig<Table> = {
  sortableColumns: [
    'tableNumber',
    'capacity',
    'status',
    'isActive',
    'createdAt',
  ],

  defaultSortBy: [['tableNumber', 'ASC']],

  searchableColumns: ['tableNumber', 'status'],

  filterableColumns: {
    status: true,
    isActive: true,
    capacity: true,
  },

  defaultLimit: 20,
  maxLimit: 50,
  relativePath: true,
};