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
