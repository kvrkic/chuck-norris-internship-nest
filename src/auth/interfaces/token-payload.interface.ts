import { TokenType } from '../enums/token-type.enum';

export interface UserPayload {
  _id: object;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TokenPayload {
  type: TokenType;
  user: UserPayload;
  iat: number;
  exp: number;
}
