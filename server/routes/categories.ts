import { Router } from 'express';
import { collections } from '../database.js';
import { requireAdmin, requireAuth, uid } from '../auth.js';
import { Category } from '../types.js';
import { cleanText } from '../validation.js';
const router = Router();
const valid = (body: Partial<Category>) => cleanText(body.name, 80) &&
  (body.color === undefined || /^#[0-9a-f]{6}$/i.test(body.color));
router.get('/', async (_req, res) => res.json(await collections().categories.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray()));
router.use(requireAuth, requireAdmin);
router.post('/', async (req, res) => {
  if (!valid(req.body || {})) return res.status(400).json({ message: 'Enter a category name (1–80 characters) and a valid hex color.' });
  const category: Category = { id: uid('cat'), name: req.body.name.trim(), color: req.body.color || '#6366f1', createdAt: new Date().toISOString() };
  await collections().categories.insertOne(category);
  res.status(201).json(category);
});
router.put('/:id', async (req, res) => {
  if (req.params.id === 'uncategorized') return res.status(400).json({ message: 'The default category cannot be changed.' });
  if (!valid(req.body || {})) return res.status(400).json({ message: 'Enter a valid category name and color.' });
  const result = await collections().categories.findOneAndUpdate({ id: String(req.params.id) },
    { $set: { name: req.body.name.trim(), ...(req.body.color ? { color: req.body.color } : {}) } },
    { returnDocument: 'after', projection: { _id: 0 } });
  if (!result) return res.status(404).json({ message: 'Category not found.' });
  res.json(result);
});
router.delete('/:id', async (req, res) => {
  if (req.params.id === 'uncategorized') return res.status(400).json({ message: 'The default category cannot be deleted.' });
  const category = await collections().categories.findOne({ id: String(req.params.id) });
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  // Move records before removing the category, so a failed reassignment never loses their category.
  await collections().expenses.updateMany({ categoryId: category.id }, { $set: { categoryId: 'uncategorized' } });
  await collections().categories.deleteOne({ id: category.id });
  res.status(204).send();
});
export default router;
