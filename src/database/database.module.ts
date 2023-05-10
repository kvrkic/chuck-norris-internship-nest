import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin-karlo:7tfMnZFHLJpNdJQ5@cluster0.bcmndgi.mongodb.net/usersDB?retryWrites=true&w=majority',
    ),
  ],
})
export class DatabaseModule {}
