import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { User } from 'src/users/schemas/user.schema';

export interface TokenPayload {
  type?: 'verification';
  user: UserPayload;
  iat: number;
  exp: number;
}
export interface UserPayload {
  _id: object;
  firstName: string;
  lastName: string;
  email: string;
}
export interface UserPayloadObject {
  user: UserPayload;
}
export interface VerificationToken {
  type: 'verification';
  user: UserPayload;
}
export interface QueryToken {
  token: string;
}
export interface Message {
  message: string;
}
export interface IRequest extends Request {
  user: User;
}
export interface JokeResponse extends AxiosResponse {
  data: JokeData;
}
export interface JokeData {
  categories: Array<string>;
  created_at: string;
  icon_url: string;
  id: string;
  updated_at: string;
  url: string;
  value: string;
}
