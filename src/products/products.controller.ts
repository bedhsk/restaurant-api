import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginatedSwaggerDocs, type PaginateQuery } from 'nestjs-paginate';

import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_PAGINATION_CONFIG } from './config/product-pagination.config';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ApiCreatedResponse({ description: 'The product has been successfully created.', type: Product })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with pagination, filtering, and search' })
  @PaginatedSwaggerDocs(Product, PRODUCT_PAGINATION_CONFIG)
  findAll(@Paginate() query: PaginateQuery) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by its ID' })
  @ApiOkResponse({ description: 'The product has been successfully retrieved.', type: Product })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by its ID' })
  @ApiOkResponse({ description: 'The product has been successfully updated.', type: Product })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by its ID' })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
