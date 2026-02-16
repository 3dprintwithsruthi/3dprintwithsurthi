# Vercel Environment Variables Fix

You mentioned you are getting the same database error on your Vercel deployment. This is because Vercel doesn't automatically sync your local .env file changes.

## 🛠️ How to Fix the Error on Vercel

1. Go to your Vercel Dashboard -> Project Settings -> **Environment Variables**.
2. Find the variable named `DATABASE_URL`.
3. Click the **Edit** (pencil) icon.
4. Update the **Value** to include `?pgbouncer=true` at the end:
   
   ```
   postgresql://postgres.anmppsxletfdcklkywks:3dprintwithsruthi@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. Click **Save**.
6. Go to the **Deployments** tab.
7. Find your latest failed deployment (or the current one), click the **three dots** (...) menu on the right.
8. Select **Redeploy**.

This will force Vercel to rebuild your application using the new environment variable, fixing the connection error.

## ✅ Why This Fix Works
Supabase uses PgBouncer for connection pooling to handle many database connections efficiently. Connection pooling modes (like "Transaction" mode, which you are using on port 6543) don't support prepared statements by default. Adding `?pgbouncer=true` tells Prisma to configure itself correctly for this setup. without it, you get the `prepared statement "s0" already exists` error.
