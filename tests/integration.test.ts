import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { MongoClient } from 'mongodb';
import request from 'supertest';
import { app } from '../server/app.js';
import { closeDatabase, collections, connectDatabase } from '../server/database.js';

// Never use the application's real database. Each run owns one uniquely named test database.
test('Atlas-backed authentication, ownership, CRUD, budgets and admin workflows', { timeout: 120000 }, async t => {
  assert.ok(process.env.MONGODB_URI, 'Set MONGODB_URI in local .env before running integration tests.');
  const originalDatabase = process.env.MONGODB_DB;
  const testDatabase = 'retain_test_' + randomUUID().replaceAll('-', '').slice(0, 24);
  process.env.MONGODB_DB = testDatabase;
  const password = 'Test-only-Password-123!';
  let userToken = '', otherToken = '', adminToken = '', expenseId = '', categoryId = '';
  const body = { title: 'Lunch [special]', amount: 12.5, categoryId: 'food', date: '2026-10-10', paymentMethod: 'Card', notes: 'Test only' };
  const auth = (token: string) => ({ Authorization: 'Bearer ' + token });
  try {
    await connectDatabase();
    await t.test('signup normalizes email, hashes password, and cannot claim admin role', async () => {
      const response = await request(app).post('/api/auth/signup').send({ name: 'Test User', email: 'USER@example.test', password, role: 'admin' });
      assert.equal(response.status, 201); assert.equal(response.body.user.role, 'user');
      assert.equal(response.body.user.email, 'user@example.test'); assert.equal(response.body.user.passwordHash, undefined);
      userToken = response.body.token;
      const stored = await collections().users.findOne({ email: 'user@example.test' });
      assert.notEqual(stored?.passwordHash, password);
    });
    await t.test('duplicate signup and wrong-password signin are rejected', async () => {
      assert.equal((await request(app).post('/api/auth/signup').send({ name: 'Duplicate', email: 'user@example.test', password })).status, 409);
      assert.equal((await request(app).post('/api/auth/signin').send({ email: 'user@example.test', password: 'wrong' })).status, 401);
    });
    await t.test('signin and session restoration return current user', async () => {
      const response = await request(app).post('/api/auth/signin').send({ email: 'user@example.test', password });
      assert.equal(response.status, 200); userToken = response.body.token;
      assert.equal((await request(app).get('/api/auth/me').set(auth(userToken))).body.email, 'user@example.test');
      const other = await request(app).post('/api/auth/signup').send({ name: 'Other', email: 'other@example.test', password });
      otherToken = other.body.token;
      const admin = await request(app).post('/api/auth/signup').send({ name: 'Admin', email: 'admin@example.test', password });
      adminToken = admin.body.token;
      await collections().users.updateOne({ email: 'admin@example.test' }, { $set: { role: 'admin' } });
    });
    await t.test('normal user cannot access admin endpoints', async () => {
      assert.equal((await request(app).get('/api/admin/insights').set(auth(userToken))).status, 403);
      assert.equal((await request(app).post('/api/categories').set(auth(userToken)).send({ name: 'Forbidden' })).status, 403);
    });
    await t.test('expense creation validates amounts, dates, categories and payment methods', async () => {
      for (const change of [{ amount: -1 }, { amount: '12' }, { amount: 1.001 }, { date: '2026-02-30' },
        { categoryId: 'missing' }, { paymentMethod: 'invalid' }, { title: ' ' }]) {
        assert.equal((await request(app).post('/api/expenses').set(auth(userToken)).send({ ...body, ...change })).status, 400);
      }
      const response = await request(app).post('/api/expenses').set(auth(userToken)).send(body);
      assert.equal(response.status, 201); expenseId = response.body.id;
    });
    await t.test('expense reads, updates and deletes enforce account ownership', async () => {
      assert.equal((await request(app).get('/api/expenses').set(auth(otherToken))).body.total, 0);
      assert.equal((await request(app).put('/api/expenses/' + expenseId).set(auth(otherToken)).send(body)).status, 404);
      assert.equal((await request(app).delete('/api/expenses/' + expenseId).set(auth(otherToken))).status, 404);
      assert.equal((await request(app).put('/api/expenses/' + expenseId).set(auth(userToken)).send({ ...body, amount: 15 })).body.amount, 15);
    });
    await t.test('pagination and combined server filters work with literal search', async () => {
      for (let i = 0; i < 10; i++) {
        assert.equal((await request(app).post('/api/expenses').set(auth(userToken)).send({ ...body, title: 'Travel ' + i, amount: 20 + i, categoryId: 'transport' })).status, 201);
      }
      const page = await request(app).get('/api/expenses?page=2&limit=8').set(auth(userToken));
      assert.equal(page.body.total, 11); assert.equal(page.body.data.length, 3);
      const filtered = await request(app).get('/api/expenses').query({ search: '[special]', category: 'food', paymentMethod: 'Card',
        dateFrom: '2026-10-01', dateTo: '2026-10-31', minAmount: 10, maxAmount: 16 }).set(auth(userToken));
      assert.equal(filtered.status, 200); assert.equal(filtered.body.total, 1);
      const sorted = await request(app).get('/api/expenses?sort=amount&direction=desc').set(auth(userToken));
      assert.equal(sorted.body.data[0].amount, 29);
      assert.equal((await request(app).get('/api/expenses?page=NaN').set(auth(userToken))).status, 400);
    });
    await t.test('budgets create, update and persist without duplicate upsert fields', async () => {
      assert.equal((await request(app).put('/api/budgets/2026-10').set(auth(userToken)).send({ amount: 1000 })).body.amount, 1000);
      assert.equal((await request(app).put('/api/budgets/2026-10').set(auth(userToken)).send({ amount: 800.5 })).body.amount, 800.5);
      assert.equal((await request(app).get('/api/budgets/2026-10').set(auth(userToken))).body.amount, 800.5);
      assert.equal((await request(app).get('/api/budgets/2026-10').set(auth(otherToken))).body.amount, 0);
      assert.equal((await request(app).get('/api/budgets/2026-11').set(auth(userToken))).body.amount, 0);
      assert.equal((await request(app).put('/api/budgets/2026-13').set(auth(userToken)).send({ amount: 1 })).status, 400);
      assert.equal((await request(app).put('/api/budgets/2026-10').set(auth(userToken)).send({ amount: -1 })).status, 400);
    });
    await t.test('admin category create and update persist', async () => {
      const created = await request(app).post('/api/categories').set(auth(adminToken)).send({ name: 'Demo test', color: '#123456' });
      assert.equal(created.status, 201); categoryId = created.body.id;
      const updated = await request(app).put('/api/categories/' + categoryId).set(auth(adminToken)).send({ name: 'Renamed test' });
      assert.equal(updated.body.name, 'Renamed test');
      await request(app).put('/api/expenses/' + expenseId).set(auth(userToken)).send({ ...body, categoryId });
    });
    await t.test('category deletion reassigns expenses and protects Uncategorized', async () => {
      assert.equal((await request(app).delete('/api/categories/' + categoryId).set(auth(adminToken))).status, 204);
      assert.equal((await collections().expenses.findOne({ id: expenseId }))?.categoryId, 'uncategorized');
      assert.equal((await request(app).delete('/api/categories/uncategorized').set(auth(adminToken))).status, 400);
    });
    await t.test('admin insights include totals, rankings and safe recent users', async () => {
      const response = await request(app).get('/api/admin/insights').set(auth(adminToken));
      assert.equal(response.status, 200); assert.equal(response.body.totals.users, 3);
      assert.equal(response.body.totals.expenses, 11); assert.equal(response.body.totals.value, 257.5);
      assert.equal(response.body.topCategories[0].id, 'transport');
      assert.equal(response.body.bottomCategories.length, 5);
      assert.equal(response.body.recentUsers[0].passwordHash, undefined);
    });
    await t.test('deletions persist and deleted default categories stay deleted after reconnect', async () => {
      assert.equal((await request(app).delete('/api/expenses/' + expenseId).set(auth(userToken))).status, 204);
      assert.equal((await request(app).delete('/api/expenses/' + expenseId).set(auth(userToken))).status, 404);
      await request(app).delete('/api/categories/shopping').set(auth(adminToken));
      await closeDatabase(); await connectDatabase();
      assert.equal(await collections().categories.findOne({ id: 'shopping' }), null);
      assert.equal((await request(app).get('/api/expenses').set(auth(userToken))).body.total, 10);
      assert.equal((await request(app).get('/api/budgets/2026-10').set(auth(userToken))).body.amount, 800.5);
    });
  } finally {
    await closeDatabase();
    // Destructive cleanup is restricted to the exact random database created above.
    assert.match(testDatabase, /^retain_test_[a-f0-9]{24}$/);
    const cleanup = new MongoClient(process.env.MONGODB_URI!);
    try {
      await cleanup.connect();
      for (const name of ['users', 'expenses', 'budgets', 'categories']) {
        await cleanup.db(testDatabase).collection(name).drop().catch(error => {
          if (error.code !== 26) throw error;
        });
      }
    }
    finally {
      await cleanup.close();
      if (originalDatabase === undefined) delete process.env.MONGODB_DB;
      else process.env.MONGODB_DB = originalDatabase;
    }
  }
});
