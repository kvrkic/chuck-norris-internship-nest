import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { Message } from 'src/auth/interfaces/token-payload.interface';

import { UsersService } from './users.service';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { ReadLoginDto } from './dto/read-login.dto';
import { VerificationQueryParamsDto } from './dto/verification-query-params.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  public create(@Body() values: RegistrationRequestDto): Promise<void> {
    return this.usersService.create(values);
  }

  @Post('/login')
  public login(
    @Body() loginRequestDto: LoginRequestDto,
  ): Promise<ReadLoginDto> {
    return this.usersService.login(loginRequestDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  public dashboard(@Request() req: AuthorizedRequest): Promise<Message> {
    return this.usersService.dashboard(req.user);
  }

  @Post('/verify')
  public verify(@Query() query: VerificationQueryParamsDto): Promise<Message> {
    return this.usersService.verify(query.token);
  }
}
