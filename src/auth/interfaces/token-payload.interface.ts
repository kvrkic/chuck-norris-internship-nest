import { ReadUserDto } from 'src/users/dto/read-user.dto';

export interface TokenPayload extends UserPayload {
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
  data: ReadUserDto;
}
