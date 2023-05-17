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
