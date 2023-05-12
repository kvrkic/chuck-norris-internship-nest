import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async create(createUserDto: CreateUserDto): Promise<ReadUserDto> {
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

    const token = jwt.sign({ createHashedUser }, process.env.JWT_SIGNING_KEY, {
      expiresIn: 600, // 10 minutes
    });
    const response = {
      user: {
        firstName: createHashedUser.firstName,
        lastName: createHashedUser.lastName,
        email: createHashedUser.email,
        password: createHashedUser.password,
      },
      access_token: token,
    };

    return response;
  }

  public async login(loginUserDto: LoginUserDto): Promise<ReadUserDto> {
    const { email } = loginUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (!existingUser) {
      throw new HttpException("This user doesn't exist!", HttpStatus.CONFLICT);
    }

    const res = await bcrypt.compare(
      loginUserDto.password,
      existingUser.password,
    );

    if (res) {
      const token = jwt.sign({ existingUser }, process.env.JWT_SIGNING_KEY, {
        expiresIn: 600, // 10 minutes
      });
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

    throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
  }

  public async findAll(request: Request): Promise<User[]> {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException(
        'You are not authenticated',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      await jwt.verify(token, process.env.JWT_SIGNING_KEY);

      return this.userModel.find().exec();
    } catch (error) {
      throw new HttpException(
        'Authentication token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // @ts-ignore
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
