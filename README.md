# Retain — Personal Expense & Budget Manager

Retain is a full-stack, responsive expense manager built for the summative assessment. It lets users record expenses, control a monthly budget, understand spending patterns, and, for administrators, manage platform categories and inspect platform-wide insights.

> **Deployment:** add the live Vercel URL here after completing the deployment steps below.

## Highlights

- Sign up, sign in, sign out, roles, and protected routes via React Context
- Personal expense create, read, update, delete, ownership authorization, search/filter/sort, and pagination-ready API responses
- Redux Toolkit exclusively owns filter/search/sort UI state
- Monthly budget setting with spent, remaining, and budget-status feedback
- Personal dashboard: current-month spend, highest expense, category breakdown, recent expenses
- Admin-only category create/delete and platform insight dashboard
- REST API with JWT authorization and persistent MongoDB Atlas storage
- Accessible form labels, useful validation messages, responsive layout

## Technology

React 19, TypeScript, Vite, React Router, React Context, Redux Toolkit, Node.js, Express, MongoDB Atlas, JWT, bcryptjs.

## Run locally

```bash
npm install
# Copy .env.example to .env and fill in your MongoDB Atlas values
npm run server
# in another terminal
npm run dev
```

Open `http://localhost:5173`. The first registered account is automatically an administrator, making it easy for the assessor to demonstrate both user and admin features. Later accounts are standard users.

`npm run build` verifies the production frontend bundle. `npm test` verifies the API health endpoint and deployment configuration. Data persists in MongoDB Atlas. Never commit `.env` or the Atlas connection string.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup`, `/api/auth/signin` | Account access |
| GET/POST/PUT/DELETE | `/api/expenses` | User-owned expenses |
| GET/PUT | `/api/budgets/:month` | Monthly budget |
| GET | `/api/categories` | Available categories |
| POST/PUT/DELETE | `/api/categories/:id` | Admin category management |
| GET | `/api/admin/insights` | Admin platform metrics |

Protected requests require `Authorization: Bearer <JWT>`. The backend validates the requesting user for expense and budget access and requires the `admin` role for administrator endpoints.

## Deployment

1. Create an Atlas M0 database; add its connection string as `MONGODB_URI` and set `MONGODB_DB=retain`.
2. Create a Render **Web Service** from this repository. Use build command `npm ci && npm run build`, start command `npm run server`, and set `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, and `NODE_ENV=production` as environment variables.
3. Verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health` returns `{ "status": "ok" }`.
4. Create a Vercel project from this repository. Set `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`, build command `npm run build`, and output directory `dist`.
5. Put the public Vercel URL at the top of this README before submission.

The local Vite proxy handles `/api` during development. In production, `VITE_API_URL` directs the frontend to the deployed API. Set a strong, private `JWT_SECRET`; do not use the development fallback in production.
