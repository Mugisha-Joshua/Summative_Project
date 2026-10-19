import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { collections } from '../database.js';
import { tokenFor, uid } from '../auth.js';
import { User } from '../types.js';

const router = Router();
const view = (user: User) => ({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
router.post('/signup', async (req, res) => { const { name, email, password } = req.body; if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email, and a 6-character password are required.' }); const users = collections().users; const normalizedEmail = String(email).toLowerCase(); if (await users.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' }); const user: User = { id: uid('usr'), name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10), role: await users.countDocuments() === 0 ? 'admin' : 'user', createdAt: new Date().toISOString() }; await users.insertOne(user); res.status(201).json({ token: tokenFor(user), user: view(user) }); });
router.post('/signin', async (req, res) => { const user = await collections().users.findOne({ email: String(req.body.email).toLowerCase() }); if (!user || !await bcrypt.compare(req.body.password || '', user.passwordHash)) return res.status(401).json({ message: 'Incorrect email or password.' }); res.json({ token: tokenFor(user), user: view(user) }); });
export default router;
