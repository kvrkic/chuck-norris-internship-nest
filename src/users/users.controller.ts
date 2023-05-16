import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';
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
  public findAll(): Promise<ReadUserDto[]> {
    return this.usersService.findAll();
  }
}
