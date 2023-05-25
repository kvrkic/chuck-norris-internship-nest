import bcrypt from 'bcryptjs';

import { Model } from 'mongoose';

import { TokenService } from '../auth/token.service';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { JokesService } from './jokes.service';
import { EmailsService } from '../emails/emails.service';
import { ErrorMessage } from '../auth/enums/errors.enum';

describe('UsersService', () => {
  const registrationRequest: RegistrationRequestDto = {
    firstName: 'test',
    lastName: 'test',
    email: 'test@example.com',
    password: 'password',
  };

  const createdUser: User & { _id: string } = {
    ...registrationRequest,
    _id: '1234567',
    password: 'hashedPassword',
    isVerified: false,
  };

  const tokenPayload = {
    _id: createdUser._id,
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    email: createdUser.email,
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateVerificationToken: jest.fn(),
    verifyVerificationToken: jest.fn(),
  };

  const mockJokesService = {
    fetchJoke: jest.fn(),
  };

  const mockEmailsService = {
    sendRegistrationMail: jest.fn(),
    sendJokeMail: jest.fn(),
  };

  const findOneExec = jest.fn();
  const mockUserModel = {
    findOne: jest.fn(() => {
      return {
        exec: findOneExec,
      };
    }),
    create: jest.fn(() => createdUser),
    findById: jest.fn(),
  };

  const mockUsersService = new UsersService(
    mockUserModel as unknown as Model<User>,
    mockTokenService as unknown as TokenService,
    mockJokesService as unknown as JokesService,
    mockEmailsService as unknown as EmailsService,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/register', () => {
    it('should create new user with hashed password', async () => {
      // @ts-ignore
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      // @ts-ignore
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      await mockUsersService.create(registrationRequest);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        registrationRequest.password,
        'salt',
      );
      expect(mockUserModel.create).toBeCalledTimes(1);
      expect(mockUserModel.create).toBeCalledWith({
        ...registrationRequest,
        password: 'hashedPassword',
      });
    });

    it('should fail with custom error if email is already used', async () => {
      findOneExec.mockReturnValueOnce(registrationRequest);

      const { email } = registrationRequest;

      await expect(
        mockUsersService.create(registrationRequest),
      ).rejects.toThrow(ErrorMessage.EMAIL_ALREADY_USED);

      expect(mockUserModel.findOne).toBeCalledTimes(1);
      expect(mockUserModel.findOne).toBeCalledWith({ email });
    });

    it('should generate a verification token', async () => {
      await mockUsersService.create(registrationRequest);

      expect(mockTokenService.generateVerificationToken).toBeCalledTimes(1);
      expect(mockTokenService.generateVerificationToken).toBeCalledWith(
        tokenPayload,
      );
    });

    it('should call the sendRegistrationMail function', async () => {
      jest
        .spyOn(mockTokenService, 'generateVerificationToken')
        .mockReturnValueOnce('token');

      await mockUsersService.create(registrationRequest);

      expect(mockEmailsService.sendRegistrationMail).toBeCalledTimes(1);
      expect(mockEmailsService.sendRegistrationMail).toBeCalledWith(
        registrationRequest.firstName,
        registrationRequest.email,
        'token',
      );
    });

    it('should fail with custom error if there is an error sending email', async () => {
      mockEmailsService.sendRegistrationMail.mockRejectedValueOnce(null);

      await expect(
        mockUsersService.create(registrationRequest),
      ).rejects.toThrow(ErrorMessage.EMAIL_ERROR);

      expect(mockEmailsService.sendRegistrationMail).toBeCalledTimes(1);
    });
  });
});
