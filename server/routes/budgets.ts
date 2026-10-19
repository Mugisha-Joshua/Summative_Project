import { Router } from 'express';
import { collections } from '../database.js';
import { AuthRequest, requireAuth, uid } from '../auth.js';
import { Budget } from '../types.js';
const router = Router(); router.use(requireAuth);
router.get('/:month', async (req: AuthRequest, res) => res.json(await collections().budgets.findOne({ userId: req.user!.id, month: String(req.params.month) }) || { month: req.params.month, amount: 0 }));
router.put('/:month', async (req: AuthRequest, res) => { const amount = +req.body.amount, month = String(req.params.month); if (amount < 0 || Number.isNaN(amount)) return res.status(400).json({ message: 'Budget must be a valid positive number.' }); const budget: Budget = { id: uid('bud'), userId: req.user!.id, month, amount }; await collections().budgets.updateOne({ userId: budget.userId, month }, { $set: { amount }, $setOnInsert: { id: budget.id, userId: budget.userId, month } }, { upsert: true }); res.json(await collections().budgets.findOne({ userId: budget.userId, month })); });
export default router;
