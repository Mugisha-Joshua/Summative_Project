# Retain: 5–10 minute demo guide

Target **9 minutes**. Use the deployed app throughout the feature demonstration, not localhost.

- Application: https://retain-joshua.vercel.app/
- API health: https://retain-api-joshua.onrender.com/api/health
- Repository: https://github.com/Mugisha-Joshua/Summative_Project

## Before recording

- [ ] Push the final commits and wait for successful **Render and Vercel** deployments of the same revision.
- [ ] Check Render has a private random JWT_SECRET of at least 32 characters.
- [ ] Confirm Vercel's production VITE_API_URL is `https://retain-api-joshua.onrender.com/api`.
- [ ] Open API health and the app early to wake Render; complete an actual sign-in.
- [ ] Verify the month picker and amount filters appear. If absent, you are viewing an older deployment.
- [ ] Have one regular user and one admin account ready. Use the README's owner-only promotion command if needed. Never display their passwords.
- [ ] Prepare at least nine expenses on the regular account, varying categories, payment methods, dates and amounts. Include an expense in a different month.
- [ ] Rehearse create → refresh → edit → refresh → delete → refresh on disposable demo expenses.
- [ ] Save a budget, refresh, sign out/in and confirm it remains saved.
- [ ] Confirm regular users are redirected away from `/admin`; signed-out visitors are redirected from protected pages to sign-in.
- [ ] Rehearse admin category create/rename/delete; use a temporary demo category, not an important existing category.
- [ ] Resize browser to roughly 390px wide and check dashboard, expense form/list/filters and admin page for overflow.
- [ ] Open the IDE files listed below; close `.env`, Render environment settings, database passwords and personal inbox tabs.
- [ ] Have DevTools Network ready to show request **URLs, methods, status codes and response JSON**. Do not expand Authorization headers, sign-in payloads or localStorage.
- [ ] Record a short sound test, check the capture area and disable distracting notifications.

## Suggested sample data

Use dates in your selected month. For a fresh demo account, prepare:

| Title | Amount | Category | Payment |
| --- | ---: | --- | --- |
| Groceries | 80 | Food & Dining | Card |
| Lunch | 20 | Food & Dining | Cash |
| Bus pass | 30 | Transport | Mobile Money |
| Taxi | 15 | Transport | Cash |
| Internet | 50 | Bills & Utilities | Bank Transfer |
| Electricity | 40 | Bills & Utilities | Mobile Money |
| Notebook | 10 | Shopping | Card |
| Shoes | 60 | Shopping | Card |
| Coffee | 5 | Food & Dining | Cash |

These nine total **310**, highest **80**; category totals: Food 105, Transport 45, Bills 90, Shopping 70. Add a separate 25 expense in the previous month to demonstrate month switching; it must not change the selected month's 310 total.

For the unchanged nine-record dataset:
- Budget 500 → remaining 190, **Within budget**.
- Budget 350 → remaining 40, **Approaching limit**.
- Budget 250 → remaining −60, **Over budget**.
- Restore budget 500 after demonstrating statuses.

If your account already has other expenses, the totals will differ. Do not claim these exact values unless using this dataset.

## Recording order and spoken explanation

### 0:00–0:40 — Introduce the deployed application

Show the public URL and briefly open the GitHub README's live links.

Say: “Retain is a personal expense and monthly budget manager. The React/TypeScript frontend is on Vercel, the Express API is on Render, and persistent data is in MongoDB Atlas.”

Show the component folders in the IDE: reusable expense form, filters, list, details, StatCard and separate page components. Mention hooks for state and loading.

### 0:40–1:30 — Authentication and protected pages

1. In a signed-out session, open `/expenses`; show redirection to sign-in.
2. Register a new regular account, then sign out.
3. Sign in to your prepared regular account.
4. Open `/admin`; show that regular users cannot enter.
5. Briefly show `src/auth.tsx` and `src/components/ProtectedRoute.tsx`.

Say: “React Context owns authentication, the current user and role. On reload, /auth/me restores the user from the API. The route guard checks Context; the backend separately checks the token and database role, so hiding an admin link is not the only protection.”

### 1:30–3:00 — Expense CRUD, details and persistence

1. Show the existing list's title, amount, category, date and payment method.
2. Create a clearly named temporary expense with notes.
3. Open its individual details and show all fields.
4. Edit its amount/title, then refresh to prove persistence.
5. Delete this temporary expense, confirm and refresh again.
6. Show Next/Previous pagination on the prepared nine-record account.
7. Briefly show a successful expenses GET/POST/PUT/DELETE in the Network panel, avoiding credentials.

Say: “The form calls typed API methods. Express verifies ownership, validates fields and saves to MongoDB. Reloading retrieves the persisted records, rather than relying on temporary component state.”

### 3:00–4:00 — Redux searching, filtering and sorting

1. Search for “Lunch”; clear the search.
2. Filter by category and payment method.
3. Show a date range and a minimum/maximum amount.
4. Reset filters; sort by date, then amount, and change direction.
5. Show `src/store.ts`: setFilters, the typed Filters state and selectFilteredExpenses.

Say: “Redux stores the expense list and every search/filter/sort option. This memoized selector performs the combined filtering and ordering. Components dispatch changes and render its results. Pagination is applied afterward.”

### 4:00–5:15 — Budgets and user dashboard

1. Select the month used for the prepared expenses.
2. Show total spent, remaining budget, highest expense, category spending and recent expenses.
3. Save budgets 500, 350 and 250 to demonstrate within/approaching/over states for the 310 dataset.
4. Refresh to prove the budget persists; restore 500.
5. Switch to the previous month, then back, showing separate monthly totals and budgets.

Say: “Monthly totals include all retrieved expense pages, not just the visible page. The budget is stored per user and month. Summary amounts use integer cents during addition to avoid floating-point display errors.”

### 5:15–7:15 — Admin dashboard and category CRUD

1. Sign out; sign in with the prepared admin account.
2. Open Admin and point out **every** required insight:
   - Total registered users, expense count, total expense value and current-month expense count.
   - Total spending per category.
   - Top five most-used and bottom five least-used categories, with usage counts.
   - Recently added expenses and recently registered users.
3. Create a temporary category “Demo category”; rename it “Demo renamed”.
4. In the admin account's personal Expenses page, create a disposable expense using that category.
5. Return to Admin and delete the temporary category.
6. Return to the expense details; show its category is now Uncategorized. Delete the disposable expense afterward if time permits.
7. Briefly show `server/auth.ts`, `server/routes/categories.ts` and `server/routes/admin.ts`.

Say: “Only admins can change categories or read platform insights. The backend reads the role from MongoDB on each protected request. Deleting a category moves its expenses to Uncategorized rather than losing them.”

### 7:15–8:00 — Responsive interface

Use browser device emulation or resize the window. Show the dashboard, expense form/list/filters and admin interface at a narrow mobile width, then restore desktop width.

Explain the responsive grid and wrapped controls. Do not only shrink the sign-in page; the rubric asks about the main app views too.

### 8:00–9:00 — Technical connection and conclusion

Show:
- `src/api.ts`: API base URL, HTTP methods and typed responses.
- `server/database.ts`: MongoDB collections and indexes, **not .env**.
- A successful request response and refresh persistence on the live app.
- GitHub README: live URL, setup, API table, tests and incremental commit history.

Say: “The browser calls the deployed REST API. The API validates JWTs and user ownership before reading or writing MongoDB collections for users, expenses, budgets and categories. Passwords are hashed and database credentials stay on the backend.”

Conclude with the working deployed URL. You can mention future hardening such as HttpOnly sessions or server-scale filtering, but do not spend demo time on unrequired features.

## Submission

- Project assignment: submit the well-documented **GitHub repository URL**.
- Demo assignment: submit the **5–10 minute video link**, with viewing permission for the assessor.
- Test the video link in a signed-out/private window; check sound, readability and duration.
- Confirm the GitHub default branch contains the final documentation and code, not just your local checkout.

Completing the checklist gives evidence for the rubric. It cannot guarantee a particular grade; the recorded explanation and assessor's evaluation matter.
