import { User } from 'src/users/schemas/user.schema';

interface CompleteUser extends User {
  _id: string;
  __v: string;
}
export interface TokenPayload extends CompleteUser {
  existingUser: CompleteUser;
  iat: number;
  exp: number;
}
