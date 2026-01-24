import { PaginateConfig } from 'nestjs-paginate';
import { Table } from 'src/tables/entities/table.entity';

export const TABLE_PAGINATION: PaginateConfig<Table> = {
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
