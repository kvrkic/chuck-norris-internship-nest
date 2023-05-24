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
  const mockTokenService = {
    generateAccessToken: jest.fn(() => {}),
    generateVerificationToken: jest.fn(() => {}),
    verifyVerificationToken: jest.fn(() => {}),
  } as unknown as TokenService;

  const mockJokesService = {
    fetchJoke: jest.fn(() => {}),
  } as unknown as JokesService;

  const mockEmailsService = {
    sendRegistrationMail: jest.fn(() => {}),
    sendJokeMail: jest.fn(() => {}),
  } as unknown as EmailsService;

  const findOneExec = jest.fn();
  const mockUserModel = {
    findOne: jest.fn(() => {
      return {
        exec: findOneExec,
      };
    }),
    create: jest.fn(() => {}),
    findById: jest.fn(() => {}),
  } as unknown as Model<User>;

  const mockUsersService = new UsersService(
    mockUserModel,
    mockTokenService,
    mockJokesService,
    mockEmailsService,
  );

  const registrationRequest: RegistrationRequestDto = {
    firstName: 'test',
    lastName: 'test',
    email: 'test@example.com',
    password: 'password',
  };
  const hashedRegistrationRequest: RegistrationRequestDto = {
    firstName: 'test',
    lastName: 'test',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const user: User & { _id: string } = {
    _id: '1234567',
    firstName: 'test',
    lastName: 'test',
    email: registrationRequest.email,
    password: 'hashedPassword',
    isVerified: false,
  };
  const tokenPayload = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/register', () => {
    it('should create new user', async () => {
      jest
        // @ts-ignore
        .spyOn(mockUsersService, 'generateTokenPayload')
        // @ts-ignore
        .mockReturnValue(null);

      await mockUsersService.create(registrationRequest);

      expect(mockUserModel.create).toBeCalledTimes(1);
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

    it('should hash the password using bcrypt', async () => {
      // @ts-ignore
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      // @ts-ignore
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      await mockUsersService.create(registrationRequest);
      expect(mockUserModel.create).toBeCalledWith(hashedRegistrationRequest);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        registrationRequest.password,
        'salt',
      );
    });

    it('should generate a verification token', async () => {
      // @ts-ignore
      jest.spyOn(mockUserModel, 'create').mockResolvedValueOnce(user);
      jest
        // @ts-ignore
        .spyOn(mockUsersService, 'generateTokenPayload')
        // @ts-ignore
        .mockReturnValueOnce(tokenPayload);

      await mockUsersService.create(registrationRequest);

      expect(mockTokenService.generateVerificationToken).toBeCalledTimes(1);
      expect(mockTokenService.generateVerificationToken).toBeCalledWith(
        tokenPayload,
      );
    });

    it('should call the sendRegistrationMail function', async () => {
      // @ts-ignore
      jest.spyOn(mockUserModel, 'create').mockResolvedValueOnce(tokenPayload);
      jest
        .spyOn(mockTokenService, 'generateVerificationToken')
        // @ts-ignore
        .mockReturnValueOnce('token');

      await mockUsersService.create(registrationRequest);

      expect(mockEmailsService.sendRegistrationMail).toBeCalledTimes(1);
      expect(mockEmailsService.sendRegistrationMail).toBeCalledWith(
        tokenPayload,
        'token',
      );
    });

    it('should fail with custom error if there is an error sending email', async () => {
      jest
        .spyOn(mockEmailsService, 'sendRegistrationMail')
        // @ts-ignore
        .mockRejectedValueOnce();
      await expect(
        mockUsersService.create(registrationRequest),
      ).rejects.toThrow(ErrorMessage.EMAIL_ERROR);
      expect(mockEmailsService.sendRegistrationMail).toBeCalledTimes(1);
    });
  });
});
