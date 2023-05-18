import { PickType } from '@nestjs/mapped-types';

import { RegistrationRequestDto } from './registration-request.dto';

export class LoginRequestDto extends PickType(RegistrationRequestDto, [
  'email',
  'password',
] as const) {}
