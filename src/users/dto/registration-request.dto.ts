import { IsNotEmpty, IsString, Length } from 'class-validator';

import { ReadUserDto } from './read-user.dto';

export class RegistrationRequestDto extends ReadUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 18)
  readonly password: string;
}
