import { User } from '../schemas/user.schema';

export interface AuthorizedRequest extends Request {
  user: User;
}
