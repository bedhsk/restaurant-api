import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { USER_PAGINATION } from 'src/common/config/pagination';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto) {
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
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        roles: true,
        tokenVersion: true,
      },
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

  findAllUsers(query: PaginateQuery) {
    return paginate(query, this.userRepository, USER_PAGINATION);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return await this.userRepository.save(user);
  }

  async softDeleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.isActive = false;
    await this.userRepository.save(user);
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
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }


}
