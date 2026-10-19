import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { collections } from './database.js';
import { User } from './types.js';

const secret = () => {
  const configured = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!configured || configured.length < 32)) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters.');
  }
  return configured || 'retain-development-secret-change-me';
};
export interface AuthRequest extends Request { user?: User; }
export function tokenFor(user: User) {
  return jwt.sign({ id: user.id }, secret(), { expiresIn: '7d' });
}
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  let id: string;
  try {
    const payload = jwt.verify(token, secret());
    if (typeof payload === 'string' || typeof payload.id !== 'string') throw new Error('Invalid token');
    id = payload.id;
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
  // Read the role from the database on every request; never trust a client role.
  const user = await collections().users.findOne({ id });
  if (!user) return res.status(401).json({ message: 'Authentication required.' });
  req.user = user;
  next();
}
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
export function uid(prefix: string) { return `${prefix}_${crypto.randomUUID()}`; }
