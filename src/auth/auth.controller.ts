import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Auth, GetUser } from './decorators';

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
}
