Production checklist — Vercel + Prisma + Supabase

Required Vercel environment variables (Project → Settings → Environment Variables):
- DATABASE_URL — Supabase Postgres connection string (production)
- DIRECT_URL — Same as DATABASE_URL (recommended for Prisma serverless)
- NEXTAUTH_URL — Your Vercel URL (https://your-project.vercel.app)
- NEXTAUTH_SECRET — Strong secret (eg. `openssl rand -base64 32`)
- (optional) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM — for transactional emails

Local / CI commands to run before first deploy (ensure `.env` or CI secrets point to Supabase):
1. `npx prisma generate`
2. `npx prisma db push`  # or `npx prisma migrate deploy` if using migrations
3. `npm run db:seed`     # seed data (run once)

Notes:
- Ensure `installCommand` in Vercel is `npm install --legacy-peer-deps` if you rely on older peer deps.
- Do NOT allow Prisma to run as part of build; ensure pages that require DB are runtime-only (`export const dynamic = 'force-dynamic'`).
- Set `NEXTAUTH_URL` after first deploy to the production URL and redeploy.
 - Set `NEXTAUTH_URL` after first deploy to the production URL and redeploy.

Railway
-------
Quick steps to deploy on Railway (Node service):
- Create a new project and add a new "Web Service".
- Set the Start Command to: `npm start` (uses `next start`).
- Set the Build Command to (in Railway service settings):
	- `npm install --legacy-peer-deps && npx prisma generate && npm run build`
- Add environment variables (Service → Variables):
	- `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optional `SMTP_*`.
- Run migrations in a release step or locally: `npx prisma migrate deploy` (or use `prisma db push` for schema push).
- Notes:
	- Railway runs your app as a long-lived process; `next start` is appropriate.
	- Ensure the database connection supports enough connections or enable a connection pooler (PgBouncer) or use Prisma Data Proxy for connection management.

Render
------
Deploying to Render (Web Service):
- Create a new Web Service and connect your Git repository.
- Environment: Node 18+ (set in service settings).
- Build Command:
	- `npm install --legacy-peer-deps && npx prisma generate && npm run build`
- Start Command:
	- `npm start`
- Environment variables (Service → Environment):
	- `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optional `SMTP_*`.
- Database migrations: Run `npx prisma migrate deploy` during your CI/build or via a one-off job in Render.
- Notes:
	- Render gives you a stable runtime (not serverless), so `next start` works and Prisma can use persistent DB connections; still prefer a pooling layer in production.

Connection pooling and Prisma
----------------------------
- For serverless builds (Vercel) prefer Prisma Data Proxy or a pooling solution. For long-lived servers (Render, Railway) a pooling layer (PgBouncer) or managed connection pooling from your DB provider is recommended.
- Always provide both `DATABASE_URL` and `DIRECT_URL` for Prisma in production.

Quick verification commands (local / CI)
-------------------------------------
1. Install deps and generate Prisma client:

```bash
npm install --legacy-peer-deps
npx prisma generate
```

2. Run migrations / push schema:

```bash
npx prisma migrate deploy   # in CI/prod
# or
npx prisma db push          # lightweight schema push for quick setup
```

3. Build and start locally to mimic production:

```bash
npm run build
npm start
```
