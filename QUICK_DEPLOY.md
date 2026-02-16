# 🚀 Quick Vercel Deployment Guide

## Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Supabase project with PostgreSQL database

---

## 📋 Quick Steps (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Production ready for Vercel"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** on your repository
3. **Don't deploy yet** - add environment variables first

### 3. Add Environment Variables
In Vercel project settings, add these **required** variables:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=run-openssl-rand-base64-32
```

**Where to get these:**
- `DATABASE_URL` & `DIRECT_URL`: Supabase → Settings → Database → Connection String
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase → Settings → API
- `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` in terminal
- `NEXTAUTH_URL`: Leave as placeholder for now, update after first deploy

### 4. Deploy
1. Click **Deploy** in Vercel
2. Wait 2-5 minutes for build
3. Copy your deployment URL (e.g., `https://3dprintwithsurthi-xxx.vercel.app`)

### 5. Update NEXTAUTH_URL
1. Go to Vercel → Project → Settings → Environment Variables
2. Edit `NEXTAUTH_URL` to your actual deployment URL
3. Go to Deployments → Latest → Three dots → **Redeploy**

### 6. Setup Database (One-time)
On your local machine with `.env` pointing to production database:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

---

## ✅ Verify Deployment

Visit your site and test:
- [ ] Homepage loads
- [ ] Can view products
- [ ] Can register new account
- [ ] Can login
- [ ] Can add to cart
- [ ] Admin login works (admin@3dprint.com / Admin@123)
- [ ] **Change admin password immediately!**

---

## 🔧 Optional: Email Notifications

Add these variables in Vercel for order status emails:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM="3D Print with Sruthi <your-email@gmail.com>"
```

Get Gmail app password: Google Account → Security → 2-Step Verification → App passwords

---

## 🌐 Optional: Custom Domain

1. Vercel → Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Update `NEXTAUTH_URL` to `https://yourdomain.com`
5. Redeploy

---

## 🐛 Common Issues

**Build fails with peer dependency error**
- Vercel should auto-use `npm install --legacy-peer-deps` from `vercel.json`

**500 errors on pages**
- Check Vercel Functions logs
- Verify all environment variables are set

**Login redirects to wrong URL**
- Ensure `NEXTAUTH_URL` matches your exact deployment URL
- Redeploy after changing

**Database connection fails**
- Verify connection strings are correct
- Check Supabase project is active
- Ensure you're using connection pooler (port 6543) for `DATABASE_URL`

---

## 📚 Full Documentation

For comprehensive deployment guide, see:
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Complete production checklist
- **[DEPLOY.md](./DEPLOY.md)** - Detailed deployment steps
- **[SETUP.md](./SETUP.md)** - Initial setup guide

---

## 🎉 You're Live!

Your 3D printing ecommerce store is now live on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Production-ready security headers
- ✅ Optimized images and performance
- ✅ SEO optimization

**Next Steps:**
1. Change default admin password
2. Add your products
3. Test order flow
4. Set up email notifications
5. Add custom domain (optional)
6. Monitor with Vercel Analytics

---

**Need Help?** Check the troubleshooting section in [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
