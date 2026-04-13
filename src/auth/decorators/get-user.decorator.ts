import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return user;
  },
);
