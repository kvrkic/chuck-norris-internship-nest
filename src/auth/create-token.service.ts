import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserPayload } from './interfaces/token-payload.interface';

@Injectable()
export class CreateTokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateToken(user: UserPayload): string {
    return this.jwtService.sign(user, {
      secret: process.env.JWT_SIGNING_KEY,
      expiresIn: 600,
    });
  }
}
