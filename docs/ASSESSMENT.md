# Assessment coverage and verification

Based on the supplied **Summative Project – Retain App (30 points)** and **Summatives Demo – Retain App (10 points)** instructions.

## Project rubric coverage

| Criterion | Points | Implementation / evidence | Recording evidence |
| --- | ---: | --- | --- |
| Components and hooks | 5 | ExpenseForm, ExpenseFilters, ExpenseList, ExpenseDetails, StatCard; page components and effects | Show component structure and CRUD interactions |
| State management/authentication | 5 | Redux selector for all expense-list filters/search/sort; Context for auth/roles; protected routes | Show state code, signup/signin/signout and rejected routes |
| TypeScript/maintainability | 4 | Typed API responses, users, expenses, budgets, insights, Redux state and props | Explain typed boundaries in API/store/Context |
| Responsive UI/UX | 4 | Responsive grids, wrapped narrow layouts, labels, native dialog, validation and status feedback | Demonstrate desktop and mobile main views |
| Expense/budget/dashboard | 3 | CRUD, all-page monthly totals, month selection, budget persistence/status and admin metrics | Show every operation and insight |
| API/database | 3 | Express REST endpoints, MongoDB collections/indexes, pagination and filtering | Network responses plus persistence after refresh |
| Backend authorization/admin | 3 | JWT, database role checks, user-scoped records, restricted category/insight APIs | Show denied user/admin access and relevant code |
| Completion/deployment/docs/Git | 3 | Live links, setup/API docs, focused commit history, release and demo checklist | Confirm final revision deployed and accessible |

The demo rubric has five equally weighted 2-point criteria: React/user features, state/authentication, admin/technical presentation, responsive UI, and deployed API/database. The timed [demo guide](DEMO.md) covers each explicitly.

## Verification record — 19 October 2026

At the time of finalization, the updated code is local until its commits are pushed and both hosting services deploy them.

- Standard automated suite: **17/17 passed**.
- Real-Atlas integration suite: **12 workflow subtests + parent passed (13 reported)**.
- Production build and frontend/backend TypeScript checks: passed.
- Public HTTP checks: frontend `/signin` and `/expenses` returned 200; backend health returned 200 with `{"status":"ok"}`.
- Public sign-in page rendered in browser. An HTTP 200 for a SPA route is not proof of an authenticated workflow.
- Integration tests used separate random test databases and removed their own test collections. No existing application records were used.
- Updated deployment workflow must still be rehearsed after publishing. See the before-recording checklist.

## Regression cases specifically covered

- Dashboard calculation includes 12 records, beyond the eight-item UI page.
- Month isolation; highest expense, category totals, recent five and money addition.
- No-budget, within, approaching and over-budget states.
- Redux literal search (including punctuation), combined filters, both sort directions, reset and empty results.
- Signup does not grant admin from client input; normalized email, duplicate account rejection and hashed passwords.
- Session restoration; invalid/missing tokens and regular-user admin denial.
- Other users cannot read, update or delete another user's expenses or read their monthly budget.
- Expense API validation, create/update/delete, pagination, search and range filters.
- Budget insert/update/read persists across database reconnection.
- Admin category create/rename/delete and reassignment to Uncategorized.
- Deleted default categories do not silently return after restart.
- Admin totals/rankings and password-hash exclusion.

## Optional local browser fixture

Run `npx tsx tests/browser-server.ts` with a valid private Atlas environment. It starts an isolated loopback test API at port 4100 and prints the generated test database name.

In another PowerShell terminal:

```powershell
$env:VITE_API_URL='http://127.0.0.1:4100/api'
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Open http://127.0.0.1:5174. Fixture-only credentials:
- Normal user: `demo-user@example.test`
- Admin: `demo-admin@example.test`
- Both passwords: `Demo-Only-123!`

These are disposable synthetic test accounts created only in the generated test database, not credentials for the deployed app. Twelve expenses total 780, with highest 120 and category totals 360/420. Save a budget of 1000 and expect remaining 220.

Stop both processes with Ctrl+C. The fixture removes its test collections. If interrupted forcibly, use the guarded cleanup helper with the exact printed test database name. Start your normal app in a fresh terminal afterward so the test API environment override is not reused.

## Scope and honest limitations

- No charts, recurring payments, notifications, bank integrations or extra admin user-management UI were added; these are not required.
- The owner-only admin-promotion script is setup tooling, not a publicly accessible admin feature.
- Automated tests are additional evidence (the assignment does not require them).
- The backend uses Node/Express with TypeScript transpiled by tsx. This remains the Node backend option rather than a second framework.
- The browser fetches all user pages for the required Redux filtering. Very large datasets, concurrent edits, token revocation, rate limits and transaction-level category deletion are future production-hardening topics.
- Free hosting can sleep, change limits or fail temporarily. A successful local test does not guarantee the deployed environment.
- The student must prepare accounts/data, publish the final revision, record a clear 5–10 minute walkthrough and submit accessible repository/video links.
- No code audit or test suite can promise 100% marks.
