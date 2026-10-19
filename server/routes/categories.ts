import { Router } from 'express';
import { collections } from '../database.js';
import { requireAdmin, requireAuth, uid } from '../auth.js';
import { Category } from '../types.js';
const router = Router(); router.get('/', async (_req, res) => res.json(await collections().categories.find().sort({ name: 1 }).toArray())); router.use(requireAuth, requireAdmin);
router.post('/', async (req, res) => { if (!req.body.name) return res.status(400).json({ message: 'Category name is required.' }); const category: Category = { id: uid('cat'), name: req.body.name, color: req.body.color || '#6366f1', createdAt: new Date().toISOString() }; await collections().categories.insertOne(category); res.status(201).json(category); });
router.put('/:id', async (req, res) => { if (req.params.id === 'uncategorized') return res.status(404).json({ message: 'Category cannot be changed.' }); const result = await collections().categories.findOneAndUpdate({ id: req.params.id }, { $set: { ...(req.body.name ? { name: req.body.name } : {}), ...(req.body.color ? { color: req.body.color } : {}) } }, { returnDocument: 'after' }); if (!result) return res.status(404).json({ message: 'Category cannot be changed.' }); res.json(result); });
router.delete('/:id', async (req, res) => { if (req.params.id === 'uncategorized') return res.status(400).json({ message: 'The default category cannot be deleted.' }); const category = await collections().categories.findOne({ id: req.params.id }); if (!category) return res.status(404).json({ message: 'Category not found.' }); await Promise.all([collections().expenses.updateMany({ categoryId: category.id }, { $set: { categoryId: 'uncategorized' } }), collections().categories.deleteOne({ id: category.id })]); res.status(204).send(); });
export default router;
