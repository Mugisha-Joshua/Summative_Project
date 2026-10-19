import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { app } from '../server/app.js';
import { validAmount, validDate, validMonth } from '../server/validation.js';

test('health responds without database access', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200); assert.equal(response.body.status, 'ok');
});
test('unknown endpoints return JSON 404', async () => {
  const response = await request(app).get('/api/missing');
  assert.equal(response.status, 404); assert.equal(response.body.message, 'Route not found.');
});
test('protected endpoints reject missing authentication', async () => {
  for (const path of ['/api/expenses', '/api/budgets/2026-10', '/api/admin/insights', '/api/auth/me']) {
    assert.equal((await request(app).get(path)).status, 401);
  }
});
test('invalid bearer token is rejected', async () => {
  assert.equal((await request(app).get('/api/expenses').set('Authorization', 'Bearer invalid')).status, 401);
});
test('malformed JSON receives a safe JSON error', async () => {
  const response = await request(app).post('/api/auth/signup').set('Content-Type', 'application/json').send('{');
  assert.equal(response.status, 400); assert.match(response.body.message, /JSON/);
});
test('signup rejects invalid fields without reaching database', async () => {
  for (const body of [{}, { name: ' ', email: 'a@b.com', password: 'abcdef' }, { name: 'A', email: 'invalid', password: 'abcdef' },
    { name: 'A', email: 'a@b.com', password: 'a' }]) {
    assert.equal((await request(app).post('/api/auth/signup').send(body)).status, 400);
  }
});
test('amount validation rejects invalid and fractional-cent money', () => {
  for (const value of [-1, 0, 1.001, Infinity, NaN, '10', null]) assert.equal(validAmount(value), false);
  assert.equal(validAmount(0, true), true); assert.equal(validAmount(12.34), true);
});
test('date validation checks real calendar days', () => {
  assert.equal(validDate('2024-02-29'), true);
  for (const value of ['2025-02-29', '2026-13-01', '2026-02-30', '2026-1-1', 'abc']) assert.equal(validDate(value), false);
});
test('month validation rejects malformed months', () => {
  assert.equal(validMonth('2026-10'), true);
  for (const value of ['2026-00', '2026-13', '26-01', '2026-1']) assert.equal(validMonth(value), false);
});
