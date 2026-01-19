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

import { Auth } from 'src/auth/decorators';
import { Table } from './entities/table.entity';
import { TablesService } from './tables.service';
import { ValidRoles as Role } from 'src/auth/interfaces';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TABLE_PAGINATION_CONFIG } from './config/table-pagination.config';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Post()
  @Auth(Role.admin, Role.manager)
  @ApiOperation({ summary: 'Create a new table' })
  @ApiCreatedResponse({
    description: 'The table has been successfully created.',
    type: Table,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or table already exists.',
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
  })
  @PaginatedSwaggerDocs(Table, TABLE_PAGINATION_CONFIG)
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.tablesService.findAll(query);
  }

  @Get(':id')
  @Auth(Role.admin, Role.manager, Role.waiter, Role.cashier)
  @ApiOperation({ summary: 'Get a table by its ID' })
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
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a table by its ID' })
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
  @ApiOperation({ summary: 'Delete a table by its ID' })
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
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.remove(id);
  }
}
