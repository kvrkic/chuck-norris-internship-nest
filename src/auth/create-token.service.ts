import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  UserPayloadObject,
  VerificationToken,
} from './interfaces/token-payload.interface';

@Injectable()
export class CreateTokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateToken(user: UserPayloadObject | VerificationToken): string {
    return this.jwtService.sign(user);
  }
}
