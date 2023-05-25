import { ApiProperty } from '@nestjs/swagger';

export class VerificationQueryParamsDto {
  @ApiProperty()
  token: string;
}
