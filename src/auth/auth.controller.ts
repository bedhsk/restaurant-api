import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto';
import { ValidRoles as Role } from './interfaces';

/**
 * Auth Controller
 * Handles user authentication: registration, login, and logout.
 * Public endpoints: register, login
 * Protected endpoints: check-status, logout (requires valid JWT)
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description: 'Public endpoint - No authentication required',
  })
  @ApiCreatedResponse({
    description:
      'User successfully registered. Returns user data and JWT token.',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        name: 'John Doe',
        email: 'john@restaurant.com',
        roles: ['manager'],
        isActive: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and get JWT token',
    description: 'Public endpoint - No authentication required',
  })
  @ApiOkResponse({
    description: 'Login successful. Returns user data and JWT token.',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        email: 'john@restaurant.com',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials (wrong email or password).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check authentication status and get new token',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'User is authenticated. Returns user data and new token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user and invalidate current token',
    description: 'Roles: Any authenticated user',
  })
  @ApiOkResponse({
    description: 'Logout successful. Token has been invalidated.',
    schema: {
      example: 'User John Doe session closed',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  logout(@GetUser() user: User) {
    return this.authService.revokeTokens(user);
  }

  @Get('users')
  @Auth(Role.admin, Role.manager)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: `Returns a paginated list of users. Roles: admin, manager
    **Filters:**
    - \`filter.isActive=true\` - Only active users
    - \`filter.isActive=false\` - Only inactive users

    **Search:** \`search=john\` - Search by name or email

    **Sort:** \`sortBy=name:ASC\` or \`sortBy=createdAt:DESC\``,
  })
  @ApiOkResponse({
    description: 'Paginated list of users returned successfully.',
    schema: {
      example: {
        data: [
          {
            id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
            name: 'John Doe',
            email: 'john@restaurant.com',
            roles: ['manager'],
            isActive: true,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
        ],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have required roles (admin, manager).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.authService.findAllUsers(query);
  }

  @Patch('users/:id')
  @Auth(Role.admin, Role.manager)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Updates user data such as name, email, or roles. Roles: admin, manager',
  })
  @ApiOkResponse({
    description: 'User updated successfully.',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        name: 'John Doe Updated',
        email: 'john.updated@restaurant.com',
        roles: ['admin'],
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:00:00Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have required roles (admin, manager).',
  })
  @ApiNotFoundResponse({
    description: 'User with the specified ID not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @Auth(Role.admin, Role.manager)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate a user (soft delete)',
    description:
      'Sets the user isActive status to false. The user record is preserved in the database. Roles: admin, manager',
  })
  @ApiNoContentResponse({
    description: 'User deactivated successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have required roles (admin, manager).',
  })
  @ApiNotFoundResponse({
    description: 'User with the specified ID not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  deleteUser(@Param('id') id: string) {
    return this.authService.softDeleteUser(id);
  }
}
