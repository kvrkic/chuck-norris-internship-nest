import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  UserPayloadObject,
  VerificationToken,
} from './interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateAccessToken(user: UserPayloadObject): string {
    return this.jwtService.sign(user);
  }

  public generateVerificationToken(user: VerificationToken): string {
    return this.jwtService.sign(user);
  }

  public verifyVerificationToken(verificationToken: string): VerificationToken {
    const payload = this.jwtService.verify(verificationToken);

    if (payload.type !== 'verification') {
      throw new HttpException('Token is not correct', HttpStatus.UNAUTHORIZED);
    }

    return payload;
  }
}
