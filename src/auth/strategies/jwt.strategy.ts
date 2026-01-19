import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET enviroment variable is not configured');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        // const { email } = payload;
        const { id } = payload;

        // const user = await this.userRepository.findOneBy({ email });
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new UnauthorizedException('Invalid token, user does not exist');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User inactive, talk to an admin');
        }

        return user;
    }
}