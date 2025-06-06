import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  userId?: Types.ObjectId;
} 