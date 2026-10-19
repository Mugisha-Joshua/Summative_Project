import 'dotenv/config';
import { connectDatabase, collections, closeDatabase } from '../server/database.js';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run admin:promote -- account@example.com');
  await connectDatabase();
  try {
    const result = await collections().users.updateOne({ email }, { $set: { role: 'admin' } });
    if (!result.matchedCount) throw new Error('Account not found. Register this account in Retain first.');
    console.log('Administrator role assigned. Sign out and back in to refresh the UI.');
  } finally { await closeDatabase(); }
}
main().catch(() => { console.error('Could not promote the account. Check the email, environment and database access.'); process.exitCode = 1; });
