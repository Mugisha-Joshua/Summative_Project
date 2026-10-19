# Retain — Personal Expense & Budget Manager

A full-stack personal expense tracker built with React, TypeScript and Vite, with an Express API and persistent MongoDB Atlas storage.

- **Live application:** [retain-joshua.vercel.app](https://retain-joshua.vercel.app/)
- **Sign in:** [retain-joshua.vercel.app/signin](https://retain-joshua.vercel.app/signin)
- **Backend health:** [retain-api-joshua.onrender.com/api/health](https://retain-api-joshua.onrender.com/api/health)
- **Repository:** [Summative_Project](https://github.com/Mugisha-Joshua/Summative_Project)
- **Recording plan:** [Demo guide](docs/DEMO.md)
- **Requirements and verification:** [Assessment checklist](docs/ASSESSMENT.md)

## Features

- Registration, sign-in, sign-out, session restoration and roles using **React Context**.
- Protected personal pages and an admin-only dashboard, backed by server-side authorization.
- Personal expense creation, listing, details, editing and deletion: title, amount, category, date, payment method and notes.
- **Redux Toolkit** owns expense-list search, category/payment/date/amount filters and date/amount ordering. A memoized Redux selector performs this logic; components display the results.
- Eight records per displayed page. The frontend retrieves every API page before filtering, so results and dashboard totals are not limited to the first eight records.
- Monthly budget create/update, selected-month totals, remaining amount, highest expense, category totals and five recent expenses.
- Budget status: no budget set when zero; within budget below 80%; approaching from 80% through 100%; over budget above 100%.
- Admin category create/update/delete. Deleted category expenses move to protected **Uncategorized**.
- All nine required admin insights: user count, expense count/value, current-month expense count, category spending, top/bottom five category usage, recent expenses and recent users.
- Responsive layout, keyboard-accessible expense detail dialog, validation, loading states and error feedback.

Amounts use USD display and at most two decimal places. Expense dates are calendar dates. The initial month and admin current-month calculation use UTC.

## Technology and structure

React, TypeScript, Vite, React Router, React Context, Redux Toolkit, Node.js, Express, MongoDB Atlas, bcrypt and JSON Web Tokens. The Node backend is written in TypeScript and executed with tsx.

| Location | Responsibility |
| --- | --- |
| `src/auth.tsx` | Context authentication and restoring the current user from the API |
| `src/components/ProtectedRoute.tsx` | User/admin route guards |
| `src/store.ts` | Typed Redux state and expense search/filter/sort selector |
| `src/components/Expense*.tsx` | Expense form, filters, list and detail dialog |
| `src/pages/Dashboard.tsx`, `src/dashboard.ts` | Monthly budget view and tested calculations |
| `src/pages/Admin.tsx` | Category management and platform insights |
| `src/api.ts` | Typed API requests, bearer token and full pagination retrieval |
| `server/routes/` | Auth, expenses, budgets, categories and admin REST endpoints |
| `server/auth.ts` | JWT validation and database-backed ownership/role checks |
| `server/database.ts` | Atlas connection, indexes and initial categories |
| `tests/` | HTTP, validation, Redux, dashboard and isolated Atlas integration checks |

Frontend → HTTPS REST API on Render → MongoDB Atlas collections: `users`, `expenses`, `budgets`, `categories`.
Passwords are hashed; the database connection string never belongs in frontend configuration.

## Local setup

Use Node.js 22.12+ (or a compatible newer LTS release) and npm.

```bash
git clone https://github.com/Mugisha-Joshua/Summative_Project.git
cd Summative_Project
npm ci --include=dev
```

Copy `.env.example` to `.env` in the repository root, then privately fill in:

| Variable | Where | Value / purpose |
| --- | --- | --- |
| `MONGODB_URI` | Backend only | Your Atlas driver connection string with database username/password; remove placeholder angle brackets and URL-encode password special characters |
| `MONGODB_DB` | Backend only | `retain` |
| `JWT_SECRET` | Backend only | A private random value; production requires at least 32 characters |
| `MONGODB_DNS_SERVERS` | Backend only | Defaults to `1.1.1.1,8.8.8.8`; use organization-approved resolvers if required |
| `VITE_API_URL` | Frontend | Local: `http://localhost:4000/api`; production: `https://retain-api-joshua.onrender.com/api` |
| `PORT` | Backend | Defaults to 4000 locally; Render provides its own value |

Generate a secret locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
Keep its output private. Never commit `.env`, put secrets in `VITE_*` variables, or show them in the recording.

Start the backend and frontend in **separate terminals**:

```bash
npm run server
```

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173). Both terminals must remain running for local use. The Vite proxy also supports `/api` when `VITE_API_URL` is omitted.

## Preparing the admin account

**Every new registration is a regular user.** Existing administrators retain their role. There is no public role-selection or automatic first-user admin promotion.

1. Register the intended admin account through the app.
2. Ensure your private local `.env` points to the same Atlas database used by Render.
3. Run the following with the email you registered:

```bash
npm run admin:promote -- your-admin-email@example.com
```

4. Sign out and sign back in. Open `/admin`.
5. Keep a separate regular account for demonstrating that admin access is denied.

Only the project owner with database access should run this command. Do not publish demo account passwords in the repository.

## Tests and build

```bash
npm test
npm run test:integration
npm run check
npx tsc -p tsconfig.node.json --noEmit
npm run build
```

- `npm test`: 17 checks covering HTTP errors/auth guards, validation, Redux filters/sorts and monthly calculations.
- `npm run test:integration`: 12 workflow subtests plus their parent test, using real MongoDB in a **uniquely named `retain_test_*` database**, not the application database. Requires Atlas access and permission to create/drop test collections. It removes its own four collections afterward, including on failure.
- Integration covers signup/signin, ownership, admin permissions, expense CRUD, pagination/filters, budget persistence after reconnect, category reassignment and insights.
- If a test is forcibly interrupted, its generated test collections may remain. The guarded recovery helper accepts only a full generated test database name: `npx tsx scripts/cleanup-test-db.ts retain_test_<24_hex_characters>`. Do not substitute your application database.
- Optional isolated browser fixture: `npx tsx tests/browser-server.ts` starts a loopback API on 4100 with disposable user/admin accounts. See [verification notes](docs/ASSESSMENT.md). Stop with Ctrl+C to clean up.

Tests are evidence, not a guarantee of every possible scenario or a grade. Rehearse the deployed workflow after the final deployment.

## API reference

Requests/responses use JSON. Protected endpoints need `Authorization: Bearer <token>`. Common errors: 400 invalid input, 401 no valid session, 403 wrong role, 404 missing/other-user expense, 409 duplicate record.

| Method | Endpoint | Access and purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public; name, email, password; returns token and regular user |
| POST | `/api/auth/signin` | Public; email, password; returns token and user |
| GET | `/api/auth/me` | Authenticated; current database user without password hash |
| GET | `/api/health` | Public liveness check; not a complete database or workflow test |
| GET | `/api/expenses` | User's records with pagination and optional filters |
| POST | `/api/expenses` | Create user's expense |
| PUT | `/api/expenses/:id` | Update user's expense |
| DELETE | `/api/expenses/:id` | Delete user's expense; 204 on success |
| GET / PUT | `/api/budgets/:month` | User's budget for YYYY-MM; PUT body `{"amount":1000}` |
| GET | `/api/categories` | Public category list |
| POST | `/api/categories` | Admin creates category with name and optional hex color |
| PUT | `/api/categories/:id` | Admin renames/recolors category |
| DELETE | `/api/categories/:id` | Admin deletes category and reassigns affected expenses |
| GET | `/api/admin/insights` | Admin platform summaries |

Expense fields: `title`, numeric `amount` (>0), `categoryId`, `date` (YYYY-MM-DD), `paymentMethod` (Card, Cash, Mobile Money, Bank Transfer), optional `notes`.

Expense list parameters: `page` (default 1), `limit` (1–50, default 8), `search` (literal title text), `category`, `paymentMethod`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`, `sort=date|amount`, `direction=asc|desc`. Response: `{data,total,page,limit,pages}`.

The UI performs its list filtering through Redux; the API also supports filters for REST clients.

## Deployment and release checklist

### Backend: Render

- Web Service connected to the repository's `main` branch.
- Build: `npm ci --include=dev && npm run build`.
- Start: `npm run server`.
- Set private `MONGODB_URI`, `MONGODB_DB=retain`, a strong `JWT_SECRET`, and `NODE_ENV=production`.
- Do not manually force port 4000; the server uses Render's `PORT`.
- Ensure Atlas Network Access permits the backend's outbound IP ranges. Prefer specific allowed ranges over unrestricted access.
- Check deployment logs and [API health](https://retain-api-joshua.onrender.com/api/health).

### Frontend: Vercel

- Project `retain-joshua`, production branch `main`, root repository directory.
- Framework: Vite; build: `npm run build`; output: `dist`.
- Production environment: `VITE_API_URL=https://retain-api-joshua.onrender.com/api`.
- Do **not** append `/health` or omit `/api`.
- Redeploy after changing this variable: Vite embeds it at build time.
- `vercel.json` rewrites SPA routes to `index.html` so refreshing `/signin`, `/expenses` and `/admin` works.

### Publish the finalized revision

1. Verify the commands above pass and inspect `git status`.
2. Push committed changes: `git push origin main`.
3. Wait for **both** Render and Vercel to finish deploying the new commit. If automatic deployment is disabled, use each dashboard's deploy/redeploy action.
4. Reload the frontend. The final version includes a month picker, minimum/maximum amount filters, and a reset-filters button.
5. Follow [the deployed smoke checklist](docs/DEMO.md#before-recording). A successful build or health response alone is insufficient.
6. Submit the GitHub repository URL for the project and an accessible 5–10 minute video link for the demo.

Free Render services may sleep after inactivity and take time to wake. Open the API and app before recording. Free service limits and availability are provider-controlled, not guaranteed. References: [Render free services](https://render.com/docs/free), [Vercel rewrites](https://vercel.com/docs/rewrites).

## Security and scope notes

- Server authorization reads roles from the database and scopes personal expense/budget requests to the authenticated user.
- JWTs expire after seven days. Sign-out removes the browser token; there is no server-side token revocation or password-reset workflow.
- Tokens are stored in localStorage; keep third-party scripts out of the app. HttpOnly cookies, rate limiting, audit logs and stricter CORS policies are future production-hardening work, not claims of completed features.
- Initial categories seed only when the collection is empty; only Uncategorized is ensured on later restarts.
- Client filtering downloads all the user's expense pages. This deliberately keeps the required logic in Redux; very large ledgers would benefit from a different server-filtered architecture.
- Category reassignment is performed before deletion but is not a multi-document transaction; concurrent category/expense edits are a known production-hardening consideration.
- This is an educational expense manager, not a financial service. Recording, submission, final deployed checks and grading remain the student's responsibility.
