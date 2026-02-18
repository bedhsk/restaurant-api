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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
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
import { PRODUCT_PAGINATION } from 'src/common/config/pagination';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(Role.admin, Role.manager)
  @ApiOperation({ summary: 'Create a new product', description: 'Roles: manager' })
  @ApiCreatedResponse({ description: 'Product created.', type: Product })
  @ApiBadRequestResponse({ description: 'Invalid input data or category does not exist.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Auth(Role.admin, Role.manager, Role.cashier)
  @ApiOperation({ summary: 'List products with pagination, filtering, and search', description: 'Roles: manager, cashier' })
  @PaginatedSwaggerDocs(Product, PRODUCT_PAGINATION)
  findAll(@Paginate() query: PaginateQuery) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Auth(Role.admin, Role.manager, Role.cashier)
  @ApiOperation({ summary: 'Get a product by ID', description: 'Roles: manager, cashier' })
  @ApiOkResponse({ description: 'Product found.', type: Product })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  @ApiOperation({ summary: 'Update a product by ID', description: 'Roles: manager' })
  @ApiOkResponse({ description: 'Product updated.', type: Product })
  @ApiBadRequestResponse({ description: 'Invalid input data or category does not exist.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager, Role.waiter)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product by ID', description: 'Roles: manager, waiter' })
  @ApiOkResponse({ description: 'Product deleted.', type: Product })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
