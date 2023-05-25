import { ApiProperty } from '@nestjs/swagger';

import { ReadUserDto } from './read-user.dto';

export class ReadLoginDto {
  @ApiProperty()
  readonly user: ReadUserDto;

  @ApiProperty()
  readonly access_token: string;
}
