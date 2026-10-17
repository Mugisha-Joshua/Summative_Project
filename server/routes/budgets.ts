import { Router } from 'express'; import { db, save } from '../database.js'; import { AuthRequest, requireAuth, uid } from '../auth.js';
const router = Router(); router.use(requireAuth);
router.get('/:month', (req: AuthRequest, res) => res.json(db.budgets.find(b => b.userId === req.user!.id && b.month === req.params.month) || { month: req.params.month, amount: 0 }));
router.put('/:month', (req: AuthRequest, res) => { const amount = +req.body.amount; if (amount < 0 || Number.isNaN(amount)) return res.status(400).json({ message: 'Budget must be a valid positive number.' }); let budget = db.budgets.find(b => b.userId === req.user!.id && b.month === req.params.month); if (budget) budget.amount = amount; else { budget = { id: uid('bud'), userId: req.user!.id, month: req.params.month, amount }; db.budgets.push(budget); } save(); res.json(budget); });
export default router;
