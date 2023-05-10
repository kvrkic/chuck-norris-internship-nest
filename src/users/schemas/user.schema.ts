import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  public firstName: string;

  @Prop()
  public lastName: string;

  @Prop()
  public email: string;

  @Prop()
  public password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
