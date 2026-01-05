import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseError } from 'pg';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USER_PAGINATION_CONFIG } from './config/user-pagination.config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userData,
        passwordHash,
      });

      const savedUser = await this.userRepository.save(user);

      return this.sanitizeUser(savedUser);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(query: PaginateQuery) {
    return paginate(query, this.userRepository, USER_PAGINATION_CONFIG);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...updateData } = updateUserDto;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    // If password is being updated, hash it
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update other fields
    Object.assign(user, updateData);

    try {
      const savedUser = await this.userRepository.save(user);
      return this.sanitizeUser(savedUser);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    await this.userRepository.remove(user);

    return { message: 'User removed successfully' };
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser as Omit<User, 'passwordHash'>;
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${error.detail}`);
        throw new BadRequestException('A user with this email already exists');
      }

      if (error.code === '23503') {
        this.logger.error(`Foreign key violation: ${error.detail}`);
        throw new BadRequestException('Invalid reference');
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
