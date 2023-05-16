import * as bcrypt from 'bcryptjs';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<void> {
    const { email } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new HttpException(
        'This email is already in use',
        HttpStatus.CONFLICT,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const createHashedUser = {
      ...createUserDto,
      password: hash,
    };

    await this.userModel.create(createHashedUser);
  }

  public async login(loginUserDto: LoginUserDto): Promise<ReadUserDto> {
    const { email } = loginUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (!existingUser) {
      throw new HttpException("This user doesn't exist!", HttpStatus.NOT_FOUND);
    }

    const res = await bcrypt.compare(
      loginUserDto.password,
      existingUser.password,
    );

    if (!res) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }

    const token = this.jwtService.sign({ existingUser });

    const response = {
      user: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        password: existingUser.password,
      },
      access_token: token,
    };

    return response;
  }

  public findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
