import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { app } from '../server/app.js';
import { closeDatabase, collections, connectDatabase } from '../server/database.js';

// Disposable local UI fixture. It never reads or writes the application's database.
async function start() {
  const databaseName = 'retain_test_' + randomUUID().replaceAll('-', '').slice(0, 24);
  process.env.MONGODB_DB = databaseName;
  await connectDatabase();
  const createdAt = new Date().toISOString(), month = createdAt.slice(0, 7);
  const passwordHash = await bcrypt.hash('Demo-Only-123!', 10);
  await collections().users.insertMany([
    { id: 'ui-user', name: 'UI Test User', email: 'demo-user@example.test', role: 'user', passwordHash, createdAt },
    { id: 'ui-admin', name: 'UI Test Admin', email: 'demo-admin@example.test', role: 'admin', passwordHash, createdAt }
  ]);
  await collections().expenses.insertMany(Array.from({ length: 12 }, (_, i) => ({
    id: 'ui-exp-' + i, userId: 'ui-user', title: i % 2 ? 'Bus ride ' + i : 'Lunch ' + i,
    amount: (i + 1) * 10, categoryId: i % 2 ? 'transport' : 'food',
    date: month + '-' + String(i + 1).padStart(2, '0'), paymentMethod: i % 2 ? 'Cash' : 'Card',
    notes: 'Disposable UI test record', createdAt
  })));
  const server = app.listen(4100, '127.0.0.1', () => console.log('UI test API ready on 127.0.0.1:4100; database ' + databaseName));
  let stopping = false;
  const stop = () => {
    if (stopping) return; stopping = true;
    server.close(async () => {
      try {
        if (!/^retain_test_[a-f0-9]{24}$/.test(databaseName)) throw new Error('Unsafe test database name');
        for (const collection of Object.values(collections())) await collection.drop();
        console.log('Disposable UI test collections removed.');
      } finally { await closeDatabase(); process.exit(0); }
    });
  };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
start().catch(() => { console.error('UI fixture startup failed.'); process.exit(1); });
