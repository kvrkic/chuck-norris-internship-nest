import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ReadUserDto } from './read-user.dto';

export class RegistrationRequestDto extends ReadUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 18)
  readonly password: string;
}
