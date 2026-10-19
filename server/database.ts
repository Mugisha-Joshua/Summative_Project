import dns from 'node:dns';
import { Collection, Db, MongoClient } from 'mongodb';
import { Budget, Category, Expense, User } from './types.js';

let client: MongoClient | undefined;
let database: Db | undefined;
const defaults: Category[] = [
  { id: 'uncategorized', name: 'Uncategorized', color: '#94a3b8', createdAt: new Date().toISOString() },
  { id: 'food', name: 'Food & Dining', color: '#f97316', createdAt: new Date().toISOString() },
  { id: 'transport', name: 'Transport', color: '#0ea5e9', createdAt: new Date().toISOString() },
  { id: 'shopping', name: 'Shopping', color: '#a855f7', createdAt: new Date().toISOString() },
  { id: 'bills', name: 'Bills & Utilities', color: '#ef4444', createdAt: new Date().toISOString() }
];

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required. Add it to your local .env file or host environment variables.');
  // Some networks refuse SRV queries through their default DNS server. Atlas SRV
  // records resolve correctly through these public resolvers; override with
  // MONGODB_DNS_SERVERS if an organization requires different resolvers.
  dns.setServers((process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8').split(','));
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGODB_DB || 'retain');
  const { users, expenses, budgets, categories } = collections();
  await Promise.all([users.createIndex({ email: 1 }, { unique: true }), expenses.createIndex({ userId: 1, date: -1 }), budgets.createIndex({ userId: 1, month: 1 }, { unique: true }), categories.createIndex({ id: 1 }, { unique: true })]);
  await categories.bulkWrite(defaults.map(category => ({ updateOne: { filter: { id: category.id }, update: { $setOnInsert: category }, upsert: true } })));
  console.log('Connected to MongoDB Atlas.');
}

export function collections() {
  if (!database) throw new Error('Database not connected.');
  return { users: database.collection<User>('users') as Collection<User>, expenses: database.collection<Expense>('expenses') as Collection<Expense>, budgets: database.collection<Budget>('budgets') as Collection<Budget>, categories: database.collection<Category>('categories') as Collection<Category> };
}

export async function closeDatabase() { await client?.close(); }
