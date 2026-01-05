import { PaginateConfig } from 'nestjs-paginate';
import { Order } from '../entities/order.entity';

export const ORDER_PAGINATION_CONFIG: PaginateConfig<Order> = {
  sortableColumns: ['orderNumber', 'status', 'total', 'createdAt', 'closedAt'],

  defaultSortBy: [['createdAt', 'DESC']],

  searchableColumns: ['orderNumber', 'notes'],

  filterableColumns: {
    status: true,
    tableId: true,
    userId: true,
  },

  relations: ['table', 'user'],

  select: [
    'id',
    'orderNumber',
    'status',
    'subtotal',
    'tax',
    'total',
    'notes',
    'closedAt',
    'tableId',
    'userId',
    'createdAt',
    'updatedAt',
    'table.id',
    'table.tableNumber',
    'user.id',
    'user.name',
  ],

  defaultLimit: 20,
  maxLimit: 50,
  relativePath: true,
};
