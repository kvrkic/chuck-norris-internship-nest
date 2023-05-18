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

export interface JokeData {
  categories: string[];
  created_at: string;
  icon_url: string;
  id: string;
  updated_at: string;
  url: string;
  value: string;
}
