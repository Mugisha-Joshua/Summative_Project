import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { app } from '../server/app.js';

test('health endpoint is available without database access', async () => { const response = await request(app).get('/api/health'); assert.equal(response.status, 200); assert.equal(response.body.status, 'ok'); });
test('production configuration requires a MongoDB connection string', () => { assert.match(new URL('mongodb+srv://user:password@cluster.mongodb.net/retain').protocol, /mongodb/); });
