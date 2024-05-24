import * as bcrypt from 'bcryptjs';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { UserPayload } from '../auth/interfaces/token-payload.interface';
import { ErrorMessage } from '../auth/enums/errors.enum';
import { EmailsService } from '../emails/emails.service';
import { TokenService } from '../auth/token.service';
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

    const newUser = await this.userModel.create(createHashedUser);

    const verificationToken = this.tokenService.generateVerificationToken(
      this.generateTokenPayload(newUser),
    );

    try {
      await this.emailsService.sendRegistrationMail(
        newUser.firstName,
        newUser.email,
        verificationToken,
      );
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

    const accessToken = this.tokenService.generateAccessToken(
      this.generateTokenPayload(existingUser),
    );

    return this.loginResponse(existingUser, accessToken);
  }

  public async getJoke(user: User): Promise<string> {
    const response = await this.jokesService.fetchJoke();

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

    const accessToken = this.tokenService.generateAccessToken(
      this.generateTokenPayload(existingUser),
    );

    return this.loginResponse(existingUser, accessToken);
  }

  public async resend(email: string): Promise<string> {
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (!existingUser) {
      throw new HttpException(
        ErrorMessage.USER_DOESNT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    const verificationToken = this.tokenService.generateVerificationToken(
      this.generateTokenPayload(existingUser),
    );

    if (existingUser.isVerified === false) {
      try {
        await this.emailsService.sendRegistrationMail(
          existingUser.firstName,
          existingUser.email,
          verificationToken,
        );
      } catch (error) {
        throw new HttpException(
          ErrorMessage.EMAIL_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return 'Verification email has been resent';
    }

    return 'Email is already verified';
  }

  private generateTokenPayload(user: User & { _id: Object }): UserPayload {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }

  private loginResponse(_user: User, accessToken: string): ReadLoginDto {
    return {
      user: {
        firstName: _user.firstName,
        lastName: _user.lastName,
        email: _user.email,
      },
      access_token: accessToken,
    };
  }
}
