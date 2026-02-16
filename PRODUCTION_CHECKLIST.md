# Production Deployment Checklist for Vercel

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Generate a strong `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to your production domain (will be updated after first deploy)
- [ ] Configure `DATABASE_URL` with Supabase connection pooler (port 6543 with `?pgbouncer=true`)
- [ ] Configure `DIRECT_URL` for migrations (port 5432, no pgbouncer)
- [ ] Set up Supabase public keys: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] (Optional) Configure Gmail SMTP for order notifications

### 2. Database
- [ ] Run `npx prisma generate` to generate Prisma client
- [ ] Run `npx prisma db push` to sync schema with database
- [ ] Run `npm run db:seed` to create admin user and sample products
- [ ] Verify database connection in Supabase dashboard
- [ ] Check that all tables are created correctly

### 3. Security
- [ ] Change default admin password after first login
- [ ] Review and update CORS settings if needed
- [ ] Ensure `.env` is in `.gitignore` (it is)
- [ ] Verify security headers are configured in `next.config.js` (✓ Done)
- [ ] Enable Supabase Row Level Security (RLS) if needed

### 4. Code Quality
- [ ] Run `npm run build` locally to check for build errors
- [ ] Run `npm run lint` to check for linting issues
- [ ] Test all critical user flows (register, login, add to cart, checkout)
- [ ] Test admin flows (create product, update order status)
- [ ] Verify image uploads work correctly

### 5. Performance
- [ ] Optimize images (use WebP/AVIF formats) - ✓ Configured
- [ ] Enable compression - ✓ Configured
- [ ] Review bundle size and lazy load heavy components
- [ ] Test loading times on slow connections

### 6. Git Repository
- [ ] Commit all changes: `git add .`
- [ ] Create meaningful commit message: `git commit -m "Production ready for Vercel deployment"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify all files are pushed correctly

---

## 🚀 Vercel Deployment Steps

### Step 1: Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `.` (leave as default)

### Step 2: Configure Environment Variables
Add these in the Vercel import screen (or later in Project Settings → Environment Variables):

**Required Variables:**
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-generated-secret
```

**Optional (Email Notifications):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="3D Print with Sruthi <your-email@gmail.com>"
```

Apply to: **Production**, **Preview**, and **Development**

### Step 3: Deploy
1. Click **Deploy**
2. Wait for the build to complete (usually 2-5 minutes)
3. Note your deployment URL (e.g., `https://3dprintwithsurthi-xxx.vercel.app`)

### Step 4: Update NEXTAUTH_URL
1. Go to **Project → Settings → Environment Variables**
2. Edit `NEXTAUTH_URL` and set it to your live URL
3. Go to **Deployments** → Click three dots on latest → **Redeploy**

### Step 5: Test Production Site
- [ ] Visit your production URL
- [ ] Test user registration and login
- [ ] Test adding products to cart
- [ ] Test checkout flow
- [ ] Test admin login (admin@3dprint.com / Admin@123)
- [ ] Test creating/editing products
- [ ] Test order status updates
- [ ] Verify email notifications work (if configured)

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)
1. Go to **Project → Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to `https://yourdomain.com`
5. Redeploy

### Monitoring & Analytics
- [ ] Set up Vercel Analytics (Project → Analytics)
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring
- [ ] Enable Vercel Speed Insights

### Database Backups
- [ ] Enable automated backups in Supabase
- [ ] Set up backup notifications
- [ ] Test restore procedure

### Email Configuration
- [ ] Test order confirmation emails
- [ ] Test order status update emails
- [ ] Configure email templates if needed
- [ ] Set up email delivery monitoring

---

## 🐛 Troubleshooting

### Build Fails
**Issue:** Peer dependency errors
**Fix:** Vercel should use `npm install --legacy-peer-deps` from `vercel.json`

**Issue:** Prisma generation fails
**Fix:** Ensure `DATABASE_URL` and `DIRECT_URL` are set in environment variables

### Runtime Errors
**Issue:** 500 errors on pages
**Fix:** Check Vercel Functions logs; verify all environment variables are set

**Issue:** Database connection fails
**Fix:** Verify Supabase connection string and ensure IP is not blocked

### Authentication Issues
**Issue:** Login redirects to wrong URL
**Fix:** Set `NEXTAUTH_URL` to exact production URL and redeploy

**Issue:** Session not persisting
**Fix:** Verify `NEXTAUTH_SECRET` is set and is the same across all deployments

### Image Loading Issues
**Issue:** Images not loading
**Fix:** Verify image domains are configured in `next.config.js`

---

## 📊 Performance Optimization

### After Deployment
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Optimize images based on actual usage
- [ ] Review and optimize database queries
- [ ] Set up CDN for static assets (Vercel does this automatically)

### Ongoing Maintenance
- [ ] Monitor error rates in Vercel dashboard
- [ ] Review function execution times
- [ ] Check database performance in Supabase
- [ ] Update dependencies regularly
- [ ] Review and optimize bundle size

---

## 🔒 Security Best Practices

### Immediate Actions
- [ ] Change default admin password
- [ ] Review user permissions
- [ ] Enable 2FA for admin accounts (if implemented)
- [ ] Set up rate limiting for API routes

### Ongoing Security
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs
- [ ] Implement CAPTCHA for registration if needed
- [ ] Set up DDoS protection (Vercel provides basic protection)

---

## 📝 Important Notes

1. **Database Migrations**: Always run migrations on your local machine first, then deploy code changes
2. **Environment Variables**: Changes to environment variables require a redeploy
3. **Caching**: Vercel caches static assets; use cache busting for critical updates
4. **Serverless Functions**: Each API route becomes a serverless function with cold start times
5. **Logs**: Check Vercel Functions logs for debugging production issues

---

## 🎉 Launch Checklist

Before announcing your site:
- [ ] All critical features tested and working
- [ ] Admin password changed from default
- [ ] Custom domain configured (if applicable)
- [ ] Email notifications working
- [ ] Analytics and monitoring set up
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags configured
- [ ] Privacy policy and terms of service added (if required)

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth Documentation**: https://next-auth.js.org

---

**Last Updated**: 2026-02-16
**Project Version**: 1.0.0
