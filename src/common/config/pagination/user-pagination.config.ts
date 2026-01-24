import { PaginateConfig } from 'nestjs-paginate';
import { User } from 'src/auth/entities/user.entity';

export const USER_PAGINATION: PaginateConfig<User> = {
  sortableColumns: ['id', 'email', 'name', 'createdAt', 'updatedAt'],

  defaultSortBy: [['createdAt', 'DESC']],

  searchableColumns: ['email', 'name'],

  filterableColumns: {
    isActive: true,
  },

  defaultLimit: 10,
  maxLimit: 50,
  relativePath: true,
};
