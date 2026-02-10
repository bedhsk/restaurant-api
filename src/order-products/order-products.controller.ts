import {
  Controller,
  Patch,
  Param,
  Delete,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemsService } from './order-items.service';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

/**
 * Order Items Controller
 * Manages individual items within orders.
 * All endpoints require authentication (any authenticated user).
 */
@ApiTags('Order Items')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Patch(':id')
  @Auth()
  @ApiOperation({
    summary: 'Update an order item (quantity, notes, or status)',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order item has been successfully updated.',
    type: OrderItem,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, invalid UUID format, or order is closed.',
  })
  @ApiNotFoundResponse({
    description: 'Order item not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove an order item',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order item has been successfully removed.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid UUID format, order is closed, or item is being prepared/served.',
  })
  @ApiNotFoundResponse({
    description: 'Order item not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemsService.remove(id);
  }
}
