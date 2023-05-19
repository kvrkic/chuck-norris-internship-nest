import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  TokenPayload,
  UserPayload,
} from './interfaces/token-payload.interface';
import { TokenType } from './enums/token-type.enum';
import { ErrorMessage } from './enums/errors.enum';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateAccessToken(user: UserPayload): string {
    return this.jwtService.sign({
      type: TokenType.ACCESS_TOKEN,
      user,
    });
  }

  public generateVerificationToken(user: UserPayload): string {
    return this.jwtService.sign({
      type: TokenType.VERIFICATION,
      user,
    });
  }

  public verifyVerificationToken(verificationToken: string): UserPayload {
    const { type, user } =
      this.jwtService.verify<TokenPayload>(verificationToken);

    if (type !== TokenType.VERIFICATION) {
      throw new HttpException(
        ErrorMessage.INCORRECT_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
