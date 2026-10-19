import 'dotenv/config';
import dns from 'node:dns';
import { MongoClient } from 'mongodb';

// Recovery helper for interrupted tests; cannot target a normal application database.
async function cleanup() {
  const name = process.argv[2];
  if (!/^retain_test_[a-f0-9]{24}$/.test(name || '')) throw new Error('An exact generated test database name is required.');
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  dns.setServers((process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8').split(','));
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    for (const collection of ['users', 'expenses', 'budgets', 'categories']) {
      await client.db(name).collection(collection).drop().catch(error => { if (error.code !== 26) throw error; });
    }
    console.log('Removed generated test collections from ' + name);
  } finally { await client.close(); }
}
cleanup().catch(() => { console.error('Test cleanup failed; check the exact test database name and database permissions.'); process.exitCode = 1; });
