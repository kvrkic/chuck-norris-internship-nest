import * as bcrypt from 'bcryptjs';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTokenService } from 'src/auth/create-token.service';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';
import { ReadLoginDto } from './dto/read-login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly createTokenService: CreateTokenService,
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

  public async login(loginUserDto: LoginUserDto): Promise<ReadLoginDto> {
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

    const token = this.createTokenService.generateToken({
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
    });

    const response = {
      user: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      },
      access_token: token,
    };

    return response;
  }

  public findAll(): Promise<ReadUserDto[]> {
    return this.userModel.find().exec();
  }
}
