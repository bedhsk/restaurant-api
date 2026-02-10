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
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductsService } from './order-products.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

/**
 * Order Products Controller
 * Manages individual products within orders.
 * All endpoints require authentication (any authenticated user).
 */
@ApiTags('Order Products')
@ApiBearerAuth()
@Controller('order-products')
export class OrderProductsController {
  constructor(private readonly orderProductsService: OrderProductsService) {}

  @Patch(':id')
  @Auth()
  @ApiOperation({
    summary: 'Update an order product (quantity, notes, or status)',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order product has been successfully updated.',
    type: OrderProduct,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, invalid UUID format, or order is closed.',
  })
  @ApiNotFoundResponse({
    description: 'Order product not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderProductDto: UpdateOrderProductDto,
  ) {
    return this.orderProductsService.update(id, updateOrderProductDto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove an order product',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The order product has been successfully removed.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid UUID format, order is closed, or item is being prepared/served.',
  })
  @ApiNotFoundResponse({
    description: 'Order product not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderProductsService.remove(id);
  }
}
