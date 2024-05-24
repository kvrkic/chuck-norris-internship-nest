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
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { ReadLoginDto } from './dto/read-login.dto';
import { VerificationQueryParamsDto } from './dto/verification-query-params.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';
import { EmailResendRequestDto } from './dto/email-resend-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  public create(@Body() values: RegistrationRequestDto): Promise<void> {
    return this.usersService.create(values);
  }

  @Post('/verify')
  @ApiOkResponse({ type: ReadLoginDto })
  public verify(
    @Query() query: VerificationQueryParamsDto,
  ): Promise<ReadLoginDto> {
    return this.usersService.verify(query.token);
  }

  @Post('/login')
  @ApiOkResponse({ type: ReadLoginDto })
  public login(
    @Body() loginRequestDto: LoginRequestDto,
  ): Promise<ReadLoginDto> {
    return this.usersService.login(loginRequestDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: String })
  public getJoke(@Request() req: AuthorizedRequest): Promise<string> {
    return this.usersService.getJoke(req.user);
  }

  @Post('resend')
  @ApiOkResponse({ type: String })
  public resend(@Query() query: EmailResendRequestDto): Promise<string> {
    return this.usersService.resend(query.email);
  }
}
