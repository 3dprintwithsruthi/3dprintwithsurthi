# Security Hardening Guide

This document covers security fixes applied to the project for production deployment.

## Critical Security Fixes Applied ✅

### 1. Image Security – Remote Patterns Restricted
- **File Modified**: `next.config.js`
- **Change**: Restricted image remotePatterns from `hostname: '**'` to specific domains:
  - `*.supabase.co` (your storage)
  - `lh3.googleusercontent.com` (Google auth avatars)
- **Impact**: Prevents image serving attacks and bandwidth theft
- **Production**: Add additional domains as needed for third-party images

### 2. Environment Variables – Credentials Management
- **Issue**: Sensitive credentials were hardcoded in `.env` file committed to repository
- **Risk**: All database passwords, API secrets exposed in git history

#### MUST DO BEFORE DEPLOYMENT:

1. **Remove `.env` from git history** (chose one method):

   **Option A: Using `git filter-branch` (recommended)**
   ```bash
   git filter-branch --tree-filter 'rm -f .env' --prune-empty HEAD
   git push origin --force --all
   git push origin --force --tags
   ```

   **Option B: Using `git-filter-repo` (faster)**
   ```bash
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths
   git push origin --force --all
   ```

2. **Create `.env.local`** (local, gitignored):
   ```bash
   # Copy .env.example and replace placeholders with actual values
   cp .env.example .env.local
   # Edit .env.local with real Supabase, NextAuth secrets
   ```

3. **Verify `.gitignore`** contains:
   ```
   .env
   .env.local
   .env.*.local
   ```

4. **Generate strong secrets** for production:
   ```bash
   # NextAuth secret
   openssl rand -base64 32
   ```

## Environment Variables for Production

### Vercel
1. Go to **Settings > Environment Variables**
2. Add all variables from `.env.example` with production values:
   - `DATABASE_URL`: Supabase PostgreSQL connection (with pgbouncer)
   - `DIRECT_URL`: Supabase PostgreSQL direct connection (for migrations)
   - `NEXTAUTH_URL`: Your production domain (e.g., `https://yourdomain.vercel.app`)
   - `NEXTAUTH_SECRET`: Output from `openssl rand -base64 32`
   - SMTP variables if using email notifications

### Railway / Render
Same as Vercel. Set all variables in the platform's environment configuration UI.

## Deployment Checklist

- [ ] `.env` removed from git history
- [ ] `.env.local` created locally with real secrets
- [ ] Generated strong `NEXTAUTH_SECRET` with openssl
- [ ] Set `NEXTAUTH_URL` to production domain (not localhost)
- [ ] All environment variables added to Vercel/Railway/Render
- [ ] Build succeeds: `npm run build`
- [ ] No sensitive data in git log: `git log --all --oneline -- .env`
- [ ] One test user created with email: try registering any user
- [ ] Try login with that user to verify auth works

## Additional Security Notes

- Never commit `.env` files to any repository
- Rotate database credentials every 6 months
- Use strong, unique passwords for production databases
- Monitor Vercel deployment logs for security warnings
- Enable 2FA on all production service accounts (Vercel, Supabase, etc.)

## References

- [NextAuth Security Best Practices](https://next-auth.js.org/configuration/providers/credentials#warning-use-with-next-js-middleware)
- [Next.js Image Optimization Security](https://nextjs.org/docs/app/api-reference/next-config-js/images#remotepatterns)
