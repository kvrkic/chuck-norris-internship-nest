import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailResendRequestDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
