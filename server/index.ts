import 'dotenv/config';
import { app } from './app.js';
import { closeDatabase, connectDatabase } from './database.js';
const port = Number(process.env.PORT) || 4000;
async function start() {
  if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET?.length || 0) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }
  await connectDatabase();
  const server = app.listen(port, '0.0.0.0', () => console.log('Retain API listening on port ' + port));
  const stop = () => server.close(() => { void closeDatabase().finally(() => process.exit(0)); });
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
start().catch(error => {
  const safe = error instanceof Error && /^(JWT_SECRET|MONGODB_URI)/.test(error.message);
  console.error(safe ? error.message : 'API startup failed. Check MongoDB credentials, network access and DNS configuration.');
  process.exit(1);
});
