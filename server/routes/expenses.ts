import { Router } from 'express';
import { collections } from '../database.js';
import { AuthRequest, requireAuth, uid } from '../auth.js';
import { Expense } from '../types.js';
import { cleanText, paymentMethods, validAmount, validDate } from '../validation.js';

const router = Router();
router.use(requireAuth);

async function valid(body: Partial<Expense>) {
  return cleanText(body.title, 120) && validAmount(body.amount) &&
    typeof body.categoryId === 'string' && validDate(body.date) &&
    paymentMethods.includes(body.paymentMethod as typeof paymentMethods[number]) &&
    (body.notes === undefined || (typeof body.notes === 'string' && body.notes.length <= 2000)) &&
    Boolean(await collections().categories.findOne({ id: body.categoryId }));
}
function fields(body: Expense) {
  return { title: body.title.trim(), amount: body.amount, categoryId: body.categoryId,
    date: body.date, paymentMethod: body.paymentMethod, notes: body.notes?.trim() || '' };
}

router.get('/', async (req: AuthRequest, res) => {
  const q = req.query;
  if (Object.values(q).some(value => typeof value !== 'string')) {
    return res.status(400).json({ message: 'Query values must be plain strings.' });
  }
  const page = Number(q.page || 1), limit = Number(q.limit || 8);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50 ||
      (q.dateFrom && !validDate(q.dateFrom)) || (q.dateTo && !validDate(q.dateTo)) ||
      (q.minAmount !== undefined && !validAmount(Number(q.minAmount), true)) ||
      (q.maxAmount !== undefined && !validAmount(Number(q.maxAmount), true)) ||
      (q.sort && !['date', 'amount'].includes(String(q.sort))) ||
      (q.direction && !['asc', 'desc'].includes(String(q.direction)))) {
    return res.status(400).json({ message: 'Invalid pagination, date, amount, or sort filter.' });
  }
  const filter: Record<string, unknown> = { userId: req.user!.id };
  if (q.search) {
    // Treat search text literally, never as a user-supplied regular expression.
    const escaped = String(q.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escaped, $options: 'i' };
  }
  if (q.category && q.category !== 'all') filter.categoryId = q.category;
  if (q.paymentMethod && q.paymentMethod !== 'all') filter.paymentMethod = q.paymentMethod;
  if (q.dateFrom || q.dateTo) filter.date = { ...(q.dateFrom ? { $gte: q.dateFrom } : {}), ...(q.dateTo ? { $lte: q.dateTo } : {}) };
  if (q.minAmount !== undefined || q.maxAmount !== undefined) filter.amount = {
    ...(q.minAmount !== undefined ? { $gte: Number(q.minAmount) } : {}),
    ...(q.maxAmount !== undefined ? { $lte: Number(q.maxAmount) } : {}) };
  const direction = q.direction === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [q.sort === 'amount' ? 'amount' : 'date']: direction, id: 1 };
  const expenses = collections().expenses;
  const [data, total] = await Promise.all([
    expenses.find(filter, { projection: { _id: 0 } }).sort(sort).skip((page - 1) * limit).limit(limit).toArray(),
    expenses.countDocuments(filter)
  ]);
  res.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
});
router.post('/', async (req: AuthRequest, res) => {
  if (!await valid(req.body || {})) return res.status(400).json({ message: 'Enter a title, positive amount (up to two decimals), valid category, date and payment method.' });
  const expense: Expense = { ...fields(req.body), id: uid('exp'), userId: req.user!.id, createdAt: new Date().toISOString() };
  await collections().expenses.insertOne(expense);
  res.status(201).json(expense);
});
router.put('/:id', async (req: AuthRequest, res) => {
  if (!await valid(req.body || {})) return res.status(400).json({ message: 'Enter valid expense fields and an existing category.' });
  const result = await collections().expenses.findOneAndUpdate(
    { id: String(req.params.id), userId: req.user!.id }, { $set: fields(req.body) },
    { returnDocument: 'after', projection: { _id: 0 } });
  if (!result) return res.status(404).json({ message: 'Expense not found.' });
  res.json(result);
});
router.delete('/:id', async (req: AuthRequest, res) => {
  const result = await collections().expenses.deleteOne({ id: String(req.params.id), userId: req.user!.id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Expense not found.' });
  res.status(204).send();
});
export default router;
