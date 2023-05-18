import { AxiosResponse } from 'axios';

export interface UserPayload {
  _id: object;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TokenPayload {
  type: string;
  user: UserPayload;
  iat: number;
  exp: number;
}

export interface Message {
  message: string;
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
