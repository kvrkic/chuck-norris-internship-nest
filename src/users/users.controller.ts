import { Controller, Get, Post, Body, Request } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  public create(@Body() createUserDto: CreateUserDto): Promise<ReadUserDto> {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  public login(@Body() loginUserDto: LoginUserDto): Promise<ReadUserDto> {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  public findAll(@Request() request: Request): Promise<User[]> {
    return this.usersService.findAll(request);
  }
}
