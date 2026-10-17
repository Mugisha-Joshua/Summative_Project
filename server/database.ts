import fs from 'node:fs'; import path from 'node:path'; import { Database } from './types.js';
const file = path.join(process.cwd(), 'server', 'data.json');
const base: Database = { users: [], categories: [
  { id: 'uncategorized', name: 'Uncategorized', color: '#94a3b8', createdAt: new Date().toISOString() },
  { id: 'food', name: 'Food & Dining', color: '#f97316', createdAt: new Date().toISOString() },
  { id: 'transport', name: 'Transport', color: '#0ea5e9', createdAt: new Date().toISOString() },
  { id: 'shopping', name: 'Shopping', color: '#a855f7', createdAt: new Date().toISOString() },
  { id: 'bills', name: 'Bills & Utilities', color: '#ef4444', createdAt: new Date().toISOString() }
], expenses: [], budgets: [] };
export const db: Database = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : base;
export function save() { fs.writeFileSync(file, JSON.stringify(db, null, 2)); }
