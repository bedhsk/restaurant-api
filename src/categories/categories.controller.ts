import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import {
  Paginate,
  PaginatedSwaggerDocs,
  type PaginateQuery,
} from 'nestjs-paginate';

import { Auth } from 'src/auth/decorators';
import { Category } from './entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ValidRoles as Role } from 'src/auth/interfaces';
import { CATEGORY_PAGINATION } from 'src/common/config/pagination';

/**
 * Categories Controller
 * Manages product categories for menu organization.
 * All endpoints require authentication with manager role.
 */
@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @Auth(Role.admin, Role.manager)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Roles: manager',
  })
  @ApiCreatedResponse({
    description: 'The category has been successfully created.',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or category already exists.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'List categories with pagination, filtering, and search',
    description: 'Roles: manager',
  })
  @PaginatedSwaggerDocs(Category, CATEGORY_PAGINATION)
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({
    summary: 'Get a category by its ID',
    description: 'Roles: manager',
  })
  @ApiOkResponse({
    description: 'The category has been successfully retrieved.',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @Auth(Role.admin, Role.manager, Role.waiter, Role.cashier)
  @ApiOperation({
    summary: 'Get all products belonging to a category',
    description: 'Roles: admin, manager, waiter, cashier',
  })
  @ApiOkResponse({
    description: 'List of products belonging to the category.',
    type: [Product],
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findProductsByCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findProductsByCategory(id);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  @ApiOperation({
    summary: 'Update a category by its ID',
    description: 'Roles: manager',
  })
  @ApiOkResponse({
    description: 'The category has been successfully updated.',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a category by its ID',
    description: 'Roles: manager',
  })
  @ApiOkResponse({
    description: 'The category has been successfully deleted.',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
