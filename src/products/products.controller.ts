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
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ValidRoles as Role } from 'src/auth/interfaces';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_PAGINATION_CONFIG } from './config/product-pagination.config';

/**
 * Products Controller
 * Manages restaurant menu products (food items, beverages, etc.)
 * All endpoints require authentication.
 */
@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Auth(Role.manager)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Roles: manager',
  })
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or category does not exist.',
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
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Auth(Role.manager, Role.cashier)
  @ApiOperation({
    summary: 'List products with pagination, filtering, and search',
    description: 'Roles: manager, cashier',
  })
  @PaginatedSwaggerDocs(Product, PRODUCT_PAGINATION_CONFIG)
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager, cashier).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Auth(Role.manager, Role.cashier)
  @ApiOperation({
    summary: 'Get a product by its ID',
    description: 'Roles: manager, cashier',
  })
  @ApiOkResponse({
    description: 'The product has been successfully retrieved.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager, cashier).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.manager)
  @ApiOperation({
    summary: 'Update a product by its ID',
    description: 'Roles: manager',
  })
  @ApiOkResponse({
    description: 'The product has been successfully updated.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, invalid UUID format, or category does not exist.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
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
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(Role.manager, Role.waiter)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a product by its ID',
    description: 'Roles: manager, waiter',
  })
  @ApiOkResponse({
    description: 'The product has been successfully deleted.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (manager, waiter).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
