import { Router } from 'express';
import { collections } from '../database.js';
import { AuthRequest, requireAuth, uid } from '../auth.js';
import { validAmount, validMonth } from '../validation.js';

const router = Router();
router.use(requireAuth);
router.get('/:month', async (req: AuthRequest, res) => {
  const month = String(req.params.month);
  if (!validMonth(month)) return res.status(400).json({ message: 'Choose a valid month (YYYY-MM).' });
  res.json(await collections().budgets.findOne({ userId: req.user!.id, month }, { projection: { _id: 0 } }) || { month, amount: 0 });
});
router.put('/:month', async (req: AuthRequest, res) => {
  const amount: unknown = req.body?.amount, month = String(req.params.month);
  if (!validMonth(month) || !validAmount(amount, true)) {
    return res.status(400).json({ message: 'Choose a valid month and a non-negative budget with at most two decimal places.' });
  }
  const userId = req.user!.id;
  // Keep insertion-only metadata separate from mutable fields: overlapping paths
  // in $set and $setOnInsert cause MongoDB to reject the entire update.
  const budget = await collections().budgets.findOneAndUpdate(
    { userId, month },
    { $set: { amount }, $setOnInsert: { id: uid('bud'), userId, month } },
    { upsert: true, returnDocument: 'after', projection: { _id: 0 } },
  );
  res.json(budget);
});
export default router;
