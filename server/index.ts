import { app } from './app.js';
import { connectDatabase } from './database.js';
const port = Number(process.env.PORT) || 4000;
connectDatabase().then(() => app.listen(port, () => console.log(`Retain API at http://localhost:${port}`))).catch(error => { console.error('MongoDB connection failed:', error); process.exit(1); });
