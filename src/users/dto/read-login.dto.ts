import { ReadUserDto } from './read-user.dto';

export class ReadLoginDto {
  readonly user: ReadUserDto;

  readonly access_token: string;
}
