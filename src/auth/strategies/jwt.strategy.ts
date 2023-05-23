import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TokenPayload } from '../interfaces/token-payload.interface';
import { ErrorMessage } from '../enums/errors.enum';
import { TokenType } from '../enums/token-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SIGNING_KEY,
    });
  }

  private async validate(payload: TokenPayload): Promise<User> {
    const { type } = payload;

    if (type !== TokenType.ACCESS_TOKEN) {
      throw new HttpException(
        ErrorMessage.INCORRECT_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userModel.findById(payload.user._id).exec();

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOESNT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}
