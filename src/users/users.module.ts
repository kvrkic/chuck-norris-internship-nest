import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { EmailsModule } from 'src/emails/emails.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JokesService } from './jokes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    HttpModule,
    EmailsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JokesService],
})
export class UsersModule {}
