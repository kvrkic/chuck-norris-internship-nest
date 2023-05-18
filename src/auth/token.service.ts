import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserPayload } from './interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateAccessToken(user: UserPayload): string {
    return this.jwtService.sign({
      type: 'access_token',
      user,
    });
  }

  public generateVerificationToken(user: UserPayload): string {
    return this.jwtService.sign({
      type: 'verification',
      user,
    });
  }

  public verifyVerificationToken(verificationToken: string): UserPayload {
    const payload = this.jwtService.verify(verificationToken);

    if (payload.type !== 'verification') {
      throw new HttpException('Token is not correct', HttpStatus.UNAUTHORIZED);
    }

    return payload.user;
  }
}
