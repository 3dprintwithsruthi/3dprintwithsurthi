# 🔧 Production Domain Configuration Guide

## Issue
The payment links are not working because the `NEXTAUTH_URL` is set to localhost. For production, this needs to be your actual domain.

## Solution

### **1. Update Environment Variables**

You need to set different `NEXTAUTH_URL` values for different environments:

#### **For Vercel Deployment:**
In your Vercel project settings → Environment Variables, add:

```
NEXTAUTH_URL=https://3dprintwithsurthi.vercel.app
```

Or if using your custom domain:
```
NEXTAUTH_URL=https://3dprintwithsurthi.in
```

#### **For Local Development:**
Keep in `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
```

### **2. Dynamic URL Configuration (Recommended)**

Instead of hardcoding URLs, we'll make the code use the current request URL dynamically. This way it works on:
- ✅ localhost
- ✅ Vercel preview URLs
- ✅ Production domain (3dprintwithsurthi.in)
- ✅ Vercel production URL

### **3. Cashfree Webhook Configuration**

In your Cashfree dashboard, you need to configure the webhook URL:

**Webhook URL:**
```
https://3dprintwithsurthi.in/api/cashfree/webhook
```

Or if using Vercel URL:
```
https://3dprintwithsurthi.vercel.app/api/cashfree/webhook
```

### **4. Vercel Environment Variables Setup**

Go to: https://vercel.com/your-project/settings/environment-variables

Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://3dprintwithsurthi.in` | Production |
| `NEXTAUTH_URL` | `https://3dprintwithsurthi.vercel.app` | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | (your secret) | All |
| `CASHFREE_APP_ID` | (your app ID) | All |
| `CASHFREE_SECRET_KEY` | (your secret key) | All |
| `CASHFREE_ENV` | `PRODUCTION` | Production |
| `NEXT_PUBLIC_CASHFREE_ENV` | `PRODUCTION` | Production |
| `DATABASE_URL` | (your database URL) | All |
| `DIRECT_URL` | (your direct URL) | All |

### **5. Code Changes Needed**

I'll update the code to use dynamic URLs based on the request headers, which will make it work on any domain automatically.

## Quick Fix for Immediate Testing

If you want to test right now on Vercel:

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add: `NEXTAUTH_URL` = `https://your-vercel-url.vercel.app`
4. Redeploy the application

## Next Steps

I'll now update the code to:
1. ✅ Use dynamic URL detection
2. ✅ Work on any domain automatically
3. ✅ Support multiple environments
4. ✅ Add proper error handling

This will make your payment links work on:
- localhost (development)
- Vercel preview URLs
- Your custom domain (3dprintwithsurthi.in)
- Any future domain changes
