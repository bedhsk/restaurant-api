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
import { Table } from './entities/table.entity';
import { TablesService } from './tables.service';
import { ValidRoles as Role } from 'src/auth/interfaces';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TABLE_PAGINATION_CONFIG } from './config/table-pagination.config';

/**
 * Tables Controller
 * Manages restaurant tables (seating areas).
 * All endpoints require authentication.
 */
@ApiTags('Tables')
@ApiBearerAuth()
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Post()
  @Auth(Role.admin, Role.manager)
  @ApiOperation({
    summary: 'Create a new table',
    description: 'Roles: admin, manager',
  })
  @ApiCreatedResponse({
    description: 'The table has been successfully created.',
    type: Table,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or table already exists.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (admin, manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @Auth(Role.admin, Role.manager, Role.waiter, Role.cashier)
  @ApiOperation({
    summary: 'List tables with pagination, filtering, and search',
    description: 'Roles: admin, manager, waiter, cashier',
  })
  @PaginatedSwaggerDocs(Table, TABLE_PAGINATION_CONFIG)
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (admin, manager, waiter, cashier).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.tablesService.findAll(query);
  }

  @Get(':id')
  @Auth(Role.admin, Role.manager, Role.waiter, Role.cashier)
  @ApiOperation({
    summary: 'Get a table by its ID',
    description: 'Roles: admin, manager, waiter, cashier',
  })
  @ApiOkResponse({
    description: 'The table has been successfully retrieved.',
    type: Table,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Table not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (admin, manager, waiter, cashier).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({
    summary: 'Update a table by its ID',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'The table has been successfully updated.',
    type: Table,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Table not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a table by its ID',
    description: 'Roles: admin, manager',
  })
  @ApiOkResponse({
    description: 'The table has been successfully deleted.',
    type: Table,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  @ApiNotFoundResponse({
    description: 'Table not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required role (admin, manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.remove(id);
  }
}
