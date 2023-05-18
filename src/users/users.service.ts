import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from 'src/auth/token.service';
import { Message } from 'src/auth/interfaces/token-payload.interface';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { ReadUserDto } from './dto/read-user.dto';
import { ReadLoginDto } from './dto/read-login.dto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT_USERNAME,
    pass: process.env.GMAIL_ACCOUNT_PASSWORD,
  },
});

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly tokenService: TokenService,
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
      isVerified: false,
    };

    await this.userModel.create(createHashedUser);

    const newUser = await this.userModel.findOne({ email }).exec();

    const verificationToken = this.tokenService.generateVerificationToken({
      type: 'verification',
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email,
      },
    });

    const info = {
      from: process.env.GMAIL_ACCOUNT_USERNAME,
      to: email,
      subject: 'Chuck Norris verification',
      html: `
      <form method="post" action="http://localhost:3000/users/verify?token=${verificationToken}">
        <h2>Chuck Norris Jokes</h2>
        <p>
          Hi ${newUser.firstName},
          We just need to verify your email address before you can access the sign in.

          Verify your email address by clicking the button below.
        </p>
        <input style="background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;"
          type="submit" value="Verify" />
      </form>`,
    };

    try {
      transporter.sendMail(info);
    } catch (error) {
      throw new HttpException(
        'Error sending email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    if (existingUser.isVerified === false) {
      throw new HttpException(
        'Please verify your email',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.tokenService.generateAccessToken({
      user: {
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      },
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

  public async verify(token: string): Promise<Message> {
    try {
      const payload = this.tokenService.verifyVerificationToken(token);

      const existingUser = await this.userModel.findById(payload.user._id);

      if (!existingUser) {
        throw new HttpException(
          "This user doesn't exist!",
          HttpStatus.NOT_FOUND,
        );
      }

      await this.userModel.findByIdAndUpdate(
        existingUser._id,
        { isVerified: true },
        { new: true },
      );

      return {
        message: 'Your email has been verified. You can now sign in',
      };
    } catch (error) {
      throw new HttpException(
        'Error with verification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
