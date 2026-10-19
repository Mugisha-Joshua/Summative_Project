import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { collections } from './database.js';
import { User } from './types.js';

const secret = () => process.env.JWT_SECRET || 'retain-development-secret-change-me';
export interface AuthRequest extends Request { user?: User; }
export function tokenFor(user: User) { return jwt.sign({ id: user.id, role: user.role }, secret(), { expiresIn: '7d' }); }
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) { try { const token = req.headers.authorization?.replace('Bearer ', ''); const payload = token && jwt.verify(token, secret()) as { id: string }; const user = payload && await collections().users.findOne({ id: payload.id }); if (!user) return res.status(401).json({ message: 'Authentication required.' }); req.user = user; next(); } catch { res.status(401).json({ message: 'Invalid or expired session.' }); } }
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) { if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' }); next(); }
export function uid(prefix: string) { return `${prefix}_${crypto.randomUUID()}`; }
