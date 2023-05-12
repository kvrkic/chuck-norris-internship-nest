import { User } from '../schemas/user.schema';

export class ReadUserDto {
  readonly user: User;

  readonly access_token: string;
}
