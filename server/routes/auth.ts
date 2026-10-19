import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { collections } from '../database.js';
import { AuthRequest, requireAuth, tokenFor, uid } from '../auth.js';
import { User } from '../types.js';
import { cleanText } from '../validation.js';

const router = Router();
const view = (user: User) => ({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
router.get('/me', requireAuth, (req: AuthRequest, res) => res.json(view(req.user!)));
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!cleanText(name, 100) || typeof email !== 'string' || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: 'Enter a name, valid email, and a password of 6–72 bytes.' });
  }
  const users = collections().users;
  const normalizedEmail = email.trim().toLowerCase();
  if (await users.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
  // Public registration never grants administrator privileges.
  const user: User = { id: uid('usr'), name: name.trim(), email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10), role: 'user', createdAt: new Date().toISOString() };
  await users.insertOne(user);
  res.status(201).json({ token: tokenFor(user), user: view(user) });
});
router.post('/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = await collections().users.findOne({ email: email.trim().toLowerCase() });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: tokenFor(user), user: view(user) });
});
export default router;
