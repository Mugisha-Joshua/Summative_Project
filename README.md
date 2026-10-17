# Retain — Personal Expense & Budget Manager

Retain is a full-stack, responsive expense manager built for the summative assessment. It lets users record expenses, control a monthly budget, understand spending patterns, and, for administrators, manage platform categories and inspect platform-wide insights.

> **Deployment:** deploy the repository to Render/Railway (API) and Vercel/Netlify (frontend), then replace this line with the live public URL before submission.

## Highlights

- Sign up, sign in, sign out, roles, and protected routes via React Context
- Personal expense create, read, update, delete, ownership authorization, search/filter/sort, and pagination-ready API responses
- Redux Toolkit exclusively owns filter/search/sort UI state
- Monthly budget setting with spent, remaining, and budget-status feedback
- Personal dashboard: current-month spend, highest expense, category breakdown, recent expenses
- Admin-only category create/delete and platform insight dashboard
- REST API with JWT authorization and persistent JSON database storage (a zero-configuration database appropriate for local demonstration)
- Accessible form labels, useful validation messages, responsive layout

## Technology

React 19, TypeScript, Vite, React Router, React Context, Redux Toolkit, Node.js, Express, JWT, bcryptjs.

## Run locally

```bash
npm install
npm run server
# in another terminal
npm run dev
```

Open `http://localhost:5173`. The first registered account is automatically an administrator, making it easy for the assessor to demonstrate both user and admin features. Later accounts are standard users.

`npm run build` verifies the production frontend bundle. Data persists in `server/data.json` after the first write; deleting that local file resets development data.

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

## Deployment note

The development proxy points `/api` to port 4000. In production, host the Express server and either serve the generated `dist` folder from it or configure the frontend host's `/api` rewrite to the API URL. Set a strong `JWT_SECRET` environment variable in production.
