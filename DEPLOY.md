# Deploy 3D Print with Sruthi to Vercel – Complete Steps

## Prerequisites

- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Supabase project with PostgreSQL
- Code pushed to a GitHub repository

---

## Step 1: Prepare the repo

```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

(Use your default branch name if different, e.g. `master`.)

---

## Step 2: Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import** next to your GitHub repo (or **Import Git Repository** and connect GitHub).
3. Select the repository **3dprintwithsruthi-2** (or your repo name).
4. **Framework Preset**: Next.js (auto-detected).
5. **Root Directory**: leave as `.` (project root).
6. **Build and Output Settings** (optional – already set in `vercel.json`):
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
7. Do **not** deploy yet – add environment variables first.

---

## Step 3: Environment variables

In the Vercel import screen (or later: **Project → Settings → Environment Variables**), add:

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres` | From Supabase → Settings → Database |
| `DIRECT_URL` | Same as `DATABASE_URL` | Required for Prisma |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | **Replace with your Vercel URL** after first deploy |
| `NEXTAUTH_SECRET` | Random string | Run: `openssl rand -base64 32` |

Optional (for order status emails):

| Name | Value |
|------|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your@gmail.com |
| `SMTP_PASS` | Gmail app password |
| `MAIL_FROM` | `"3D Print with Sruthi <your@gmail.com>"` |

- Apply to **Production**, **Preview**, and **Development** if you use preview deployments.
- Click **Deploy** (or **Save** then deploy from the dashboard).

---

## Step 4: First deployment

1. Click **Deploy**.
2. Wait for the build. If it fails on install, Vercel will use `vercel.json`’s `installCommand` on the next run.
3. After a successful deploy, note the URL (e.g. `https://3dprintwithsruthi-xxx.vercel.app`).

---

## Step 5: Set NEXTAUTH_URL and redeploy

1. Go to **Project → Settings → Environment Variables**.
2. Edit `NEXTAUTH_URL` and set it to your live URL (e.g. `https://3dprintwithsruthi-xxx.vercel.app`).
3. **Redeploy**: **Deployments** → three dots on latest → **Redeploy**.

---

## Step 6: Database (migrations and seed)

Run these **on your machine** with `.env` pointing to the **same** Supabase project used in Vercel:

```bash
# Ensure .env has production DATABASE_URL and DIRECT_URL
npx prisma generate
npx prisma db push
# Or, if you use migrations:
# npx prisma migrate deploy

# Seed once (admin + user + sample products)
npm run db:seed
```

---

## Step 7: Custom domain (optional)

1. **Project → Settings → Domains**.
2. Add your domain and follow DNS instructions.
3. In **Environment Variables**, set `NEXTAUTH_URL` to `https://yourdomain.com`.
4. Redeploy.

---

## Optimizations in this project

- **Prefetch**: Key `<Link>`s use prefetch so next pages load faster.
- **Loading UI**: `src/app/loading.tsx` shows a spinner during route transitions.
- **Lazy cart**: Cart side panel is loaded with `dynamic(..., { ssr: false })` to reduce initial JS.
- **Icons**: `optimizePackageImports: ['lucide-react']` in `next.config.js` for smaller bundles.
- **Images**: `next/image` with `sizes` for responsive images.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: peer dependency | Ensure `vercel.json` has `"installCommand": "npm install --legacy-peer-deps"`. |
| 500 on some pages | Check Vercel **Functions** logs; ensure `DATABASE_URL` and `DIRECT_URL` are set. |
| Login redirects to wrong URL | Set `NEXTAUTH_URL` exactly to your Vercel (or custom) URL and redeploy. |
| Favicon not updating | Replace `public/logo.png` and copy to `src/app/icon.png` and `src/app/apple-icon.png`, then redeploy. |
