import { User } from 'src/users/schemas/user.schema';

export interface CompleteUser extends User {
  _id: string;
  __v: string;
}
export interface TokenPayload {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  iat: number;
  exp: number;
}
export interface UserPayload {
  _id: object;
  firstName: string;
  lastName: string;
  email: string;
}
