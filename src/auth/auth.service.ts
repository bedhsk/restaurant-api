import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        email: email.toLowerCase().trim(),
        password: hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return {
        ...this.sanitizeUser(user),
        token: this.getJwtToken({
          id: user.id,
          tokenVersion: user.tokenVersion,
        }),
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, tokenVersion: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      ...this.sanitizeUser(user),
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async revokeTokens(user: User) {
    user.tokenVersion += 1;
    await this.userRepository.save(user);
    return `User ${user.name} session closed`;
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private handleExceptions(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        detail?: string;
      };

      if (driverError.code === '23505') {
        this.logger.error(`Violation UNIQUE: ${driverError.detail}`);
        throw new BadRequestException('A user with this email already exists');
      }

      if (driverError.code === '23503') {
        this.logger.error(`Foreign key violation: ${driverError.detail}`);
        throw new BadRequestException('Invalid reference to related entity');
      }

      if (driverError.code === '23502') {
        this.logger.error(`Not null violation: ${driverError.detail}`);
        throw new BadRequestException('Required field is missing');
      }

      if (driverError.code === '22001') {
        this.logger.error(`String too long: ${driverError.detail}`);
        throw new BadRequestException('Input value exceeds maximum length');
      }

      if (driverError.code === '22P02') {
        this.logger.error(`Invalid input syntax: ${driverError.detail}`);
        throw new BadRequestException('Invalid input format');
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
