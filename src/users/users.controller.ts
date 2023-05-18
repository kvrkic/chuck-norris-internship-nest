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
import {
  IRequest,
  Message,
  QueryToken,
} from 'src/auth/interfaces/token-payload.interface';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadLoginDto } from './dto/read-login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  public create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  public login(@Body() loginUserDto: LoginUserDto): Promise<ReadLoginDto> {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  public dashboard(@Request() req: IRequest): Promise<Message> {
    return this.usersService.dashboard(req.user);
  }

  @Post('/verify')
  public verify(@Query() query: QueryToken): Promise<Message> {
    return this.usersService.verify(query.token);
  }
}
