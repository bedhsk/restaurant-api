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
import { Auth } from 'src/auth/decorators';
import { ValidRoles as Role } from 'src/auth/interfaces';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new order with items' })
  @ApiCreatedResponse({
    description: 'The order has been successfully created with all items.',
    type: Order,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, table/user/products not found, or products unavailable.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'List orders with pagination, filtering, and search',
  })
  @PaginatedSwaggerDocs(Order, ORDER_PAGINATION_CONFIG)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get an order by its ID with all items' })
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
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update order notes' })
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
  @ApiOperation({ summary: 'Update order status' })
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
  @ApiOperation({ summary: 'Add items to an existing order' })
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
  @ApiOperation({ summary: 'Delete an order by its ID' })
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
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
