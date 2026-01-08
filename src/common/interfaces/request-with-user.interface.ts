import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: string | number;
    name: string;
    email: string;
    role?: string;
  };
}
