import { PaginateConfig } from "nestjs-paginate";
import { User } from "../entities/user.entity";

export const USER_PAGINATION_CONFIG: PaginateConfig<User> = {
    sortableColumns: [
        'name',
        'email',
        'role',
        'isActive',
        'createdAt'
    ],

    defaultSortBy: [
        ['createdAt', 'DESC'],
    ],

    searchableColumns: ['name', 'email'],

    filterableColumns: {
        role: true,
        isActive: true,
    },

    select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt'
    ],

    defaultLimit: 20,
    maxLimit: 50,
    relativePath: true
}