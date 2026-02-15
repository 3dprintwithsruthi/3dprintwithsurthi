# 3D Print with Sruthi – Setup Instructions

## 1. Create Next.js app (already done)

If starting from scratch:

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

## 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

(Use `--legacy-peer-deps` if you see a peer dependency conflict with nodemailer/next-auth.)

## 3. Supabase setup

1. Create a project at [Supabase](https://supabase.com) (or use your existing one).
2. Go to **Settings → Database** and copy the **Connection string** (URI format).
3. In your project root, copy `.env.example` to `.env` if you haven’t already. A sample `.env` is included; replace with your own `DATABASE_URL` and `DIRECT_URL` if needed.
4. For a single Supabase DB, you can use the same URI for both:
   - `DATABASE_URL`: `postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
   - `DIRECT_URL`: same as `DATABASE_URL` (required by Prisma for migrations).
5. If you use the **Transaction pooler** (port 6543), use that for `DATABASE_URL` and add `?pgbouncer=true`; keep a direct connection (5432) for `DIRECT_URL`.

## 4. Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` – Supabase connection string (with pgbouncer)
- `DIRECT_URL` – Supabase direct connection (for migrations)
- `NEXTAUTH_URL` – e.g. `http://localhost:3000` (in production use your domain)
- `NEXTAUTH_SECRET` – run: `openssl rand -base64 32`
- Gmail SMTP (optional for order emails):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

## 5. Prisma migration and generate

```bash
npx prisma generate
npx prisma db push
```

Or with migrations:

```bash
npx prisma migrate dev --name init
```

## 6. Seed database

```bash
npm run db:seed
```

This creates:

- Admin: `admin@3dprint.com` / `Admin@123`
- User: `user@3dprint.com` / `User@123`
- Sample products (e.g. Couple Name Keychain with custom fields)

## 7. Gmail SMTP (order status emails)

1. Use a Gmail account and enable 2FA.
2. Create an **App Password**: Google Account → Security → App passwords.
3. Set in `.env`:
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASS=your-16-char-app-password`
   - `MAIL_FROM="3D Print with Sruthi <your-email@gmail.com>"`

If SMTP is not set, order status updates still work; emails are skipped (no error).

## 8. Favicon / title icon

The app uses `src/app/icon.png` and `src/app/apple-icon.png` as the browser tab icon and Apple touch icon. These are copied from `public/logo.png`. If you replace `public/logo.png`, copy it again to `src/app/icon.png` and `src/app/apple-icon.png` so the tab icon updates.

## 9. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The **default home page** (for both user and admin when visiting the site) is the landing page at `/`. Clicking the **navbar logo** (“3D PRINT with Sruthi”) always opens this home page.

---

## Production deployment (Vercel)

**Full step-by-step guide:** see **[DEPLOY.md](./DEPLOY.md)** for complete Vercel setup, env vars, and troubleshooting.

Quick steps:

1. Push code to GitHub and import the repo in [Vercel](https://vercel.com) (Import Git Repository).
2. **Environment Variables** – In Vercel project **Settings → Environment Variables**, add:
   - `DATABASE_URL` – Supabase connection string
   - `DIRECT_URL` – Supabase direct URL (same as above if using single connection)
   - `NEXTAUTH_URL` – **Must be your production URL** (e.g. `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` – Generate with `openssl rand -base64 32`
   - Optional (emails): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
3. **Build** – Vercel uses `vercel.json` (install: `npm install --legacy-peer-deps`). No extra build command needed.
4. **Deploy** – Click Deploy. After first deploy, run migrations from your machine against production DB (set `.env` to production Supabase), then: `npx prisma migrate deploy` or `npx prisma db push`.
5. **Seed** (once): `npm run db:seed` with production `.env`.
6. **Custom domain** – In Vercel, add your domain and set `NEXTAUTH_URL` to that domain.

---

## Folder structure (overview)

- `src/app/` – App Router pages (landing, login, register, products, checkout, orders, admin)
- `src/app/actions/` – Server actions (auth, product, order)
- `src/auth/` – NextAuth config and handler
- `src/components/` – UI and layout (navbar, cart panel, forms)
- `src/lib/` – DB client, validations, email, auth-server
- `src/store/` – Cart (Zustand)
- `prisma/` – Schema and seed
