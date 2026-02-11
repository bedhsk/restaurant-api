import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Paginate,
  PaginatedSwaggerDocs,
  type PaginateQuery,
} from 'nestjs-paginate';

import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ORDER_PAGINATION } from 'src/common/config/pagination';
import { AddItemsDto } from './dto/add-items.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new order with products', description: 'Roles: Any authenticated user' })
  @ApiCreatedResponse({ description: 'Order created.', type: Order })
  @ApiBadRequestResponse({ description: 'Invalid input data, table/products not found, or products unavailable.' })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List orders with pagination, filtering, and search', description: 'Roles: Any authenticated user' })
  @PaginatedSwaggerDocs(Order, ORDER_PAGINATION)
  findAll(@Paginate() query: PaginateQuery) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get an order by ID with all products', description: 'Roles: Any authenticated user' })
  @ApiOkResponse({ description: 'Order found.', type: Order })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update order notes', description: 'Roles: Any authenticated user' })
  @ApiOkResponse({ description: 'Order updated.', type: Order })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @Auth()
  @ApiOperation({ summary: 'Update order status', description: 'Roles: Any authenticated user' })
  @ApiOkResponse({ description: 'Order status updated.', type: Order })
  @ApiBadRequestResponse({ description: 'Invalid status value.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/items')
  @Auth()
  @ApiOperation({ summary: 'Add products to an existing order', description: 'Roles: Any authenticated user' })
  @ApiCreatedResponse({ description: 'Products added to order.', type: Order })
  @ApiBadRequestResponse({ description: 'Order is closed or products not found/unavailable.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  addItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemsDto: AddItemsDto,
  ) {
    return this.ordersService.addItems(id, addItemsDto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an order by ID', description: 'Roles: Any authenticated user' })
  @ApiOkResponse({ description: 'Order deleted.', type: Order })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
