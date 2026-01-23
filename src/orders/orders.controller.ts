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
} from '@nestjs/swagger';
import {
  Paginate,
  PaginatedSwaggerDocs,
  type PaginateQuery,
} from 'nestjs-paginate';

import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { ORDER_PAGINATION_CONFIG } from './config/order-pagination.config';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

/**
 * Orders Controller
 * Manages customer orders including creation, status updates, and item management.
 * All endpoints require authentication (any authenticated user).
 */
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Create a new order with items',
    description: 'Roles: Any authenticated user',
  })
  @ApiCreatedResponse({
    description: 'The order has been successfully created with all items.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, table/user/products not found, or products unavailable.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'List orders with pagination, filtering, and search',
    description: 'Roles: Any authenticated user',
  })
  @PaginatedSwaggerDocs(Order, ORDER_PAGINATION_CONFIG)
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({
    summary: 'Get an order by its ID with all items',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order has been successfully retrieved with items.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({
    summary: 'Update order notes',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order has been successfully updated.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @Auth()
  @ApiOperation({
    summary: 'Update order status',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order status has been successfully updated.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Invalid status value or invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/items')
  @Auth()
  @ApiOperation({
    summary: 'Add items to an existing order',
    description: 'Roles: Any authenticated user',
  })
  @ApiCreatedResponse({
    description: 'Items have been successfully added to the order.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, order is closed, or products not found/unavailable.',
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  addItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemsDto: AddItemsDto,
  ) {
    return this.ordersService.addItems(id, addItemsDto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an order by its ID',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order has been successfully deleted.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
