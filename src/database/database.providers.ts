import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(
        'mongodb+srv://admin-karlo:7tfMnZFHLJpNdJQ5@cluster0.bcmndgi.mongodb.net/usersDB?retryWrites=true&w=majority',
      ),
  },
];
