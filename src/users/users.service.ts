import * as bcrypt from 'bcryptjs';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from 'src/auth/token.service';
import { EmailsService } from 'src/emails/emails.service';
import { ErrorMessage } from 'src/auth/enums/errors.enum';

import { RegistrationRequestDto } from './dto/registration-request.dto';
import { User } from './schemas/user.schema';
import { LoginRequestDto } from './dto/login-request.dto';
import { ReadLoginDto } from './dto/read-login.dto';
import { JokesService } from './jokes.service';

@Injectable()
export class UsersService {
  // eslint-disable-next-line max-params
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly jokesService: JokesService,
    private readonly emailsService: EmailsService,
  ) {}

  public async create(createValues: RegistrationRequestDto): Promise<void> {
    const { email } = createValues;

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new HttpException(
        ErrorMessage.EMAIL_ALREADY_USED,
        HttpStatus.CONFLICT,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createValues.password, salt);

    const createHashedUser = {
      ...createValues,
      password: hash,
    };

    await this.userModel.create(createHashedUser);

    const newUser = await this.userModel.findOne({ email }).exec();

    const verificationToken = this.tokenService.generateVerificationToken({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email,
    });

    try {
      await this.emailsService.sendRegistrationMail(newUser, verificationToken);
    } catch (error) {
      throw new HttpException(
        ErrorMessage.EMAIL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async login(loginRequestDto: LoginRequestDto): Promise<ReadLoginDto> {
    const { email } = loginRequestDto;
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (!existingUser) {
      throw new HttpException(
        ErrorMessage.USER_DOESNT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    const res = await bcrypt.compare(
      loginRequestDto.password,
      existingUser.password,
    );

    if (!res) {
      throw new HttpException(
        ErrorMessage.INCORRECT_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (existingUser.isVerified === false) {
      throw new HttpException(
        ErrorMessage.VERIFY_EMAIL,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.tokenService.generateAccessToken({
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email,
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

  public async dashboard(user: User): Promise<string> {
    const response = await this.jokesService.getJoke();

    await this.emailsService.sendJokeMail(user, response);

    return response;
  }

  public async verify(verificationToken: string): Promise<ReadLoginDto> {
    const user = this.tokenService.verifyVerificationToken(verificationToken);

    const existingUser = await this.userModel.findById(user._id);

    if (!existingUser) {
      throw new HttpException(
        ErrorMessage.USER_DOESNT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    existingUser.isVerified = true;

    await existingUser.save();

    const accesToken = this.tokenService.generateAccessToken({
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
      access_token: accesToken,
    };

    return response;
  }
}
