# 3D Print with Sruthi – Custom 3D Printing Store

[![Production Ready](https://img.shields.io/badge/production-ready-brightgreen.svg)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

Production-ready ecommerce application built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase (PostgreSQL)**, **Prisma**, and **NextAuth**.

## 🚀 Quick Deploy to Vercel

**Deploy in 5 minutes:** See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## ✨ Features

### Customer Features
- **Auth**: Secure registration and login with bcrypt password hashing and NextAuth sessions
- **Store**: Beautiful landing page with hero section, featured products, and search
- **Products**: Grid view with pagination, sorting, filtering, and detailed product pages
- **Shopping**: Side panel cart, seamless checkout with address collection
- **Orders**: Complete order history with real-time status tracking

### Admin Features (`/admin`)
- **Dashboard**: Revenue analytics, order counts, and status breakdown
- **Products**: Full CRUD operations with image/video upload and custom fields
- **Orders**: Manage orders with custom inputs and status updates
- **Customers**: View customer list with order history
- **Analytics**: Most sold products, revenue charts, and low stock alerts

### Order Management
- Automated inventory tracking
- Status workflow: Pending → Accepted → InProgress → Shipped → Delivered
- Email notifications on status changes (via Nodemailer + Gmail SMTP)
- Admin can reject orders with automatic inventory restoration

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **Auth**: NextAuth (Credentials provider, session-based)
- **State**: Zustand (cart management)
- **Validation**: Zod, React Hook Form
- **Email**: Nodemailer (Gmail SMTP)
- **Deployment**: Vercel (optimized for production)

## 📦 Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Seed Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@3dprint.com | Admin@123 |
| User  | user@3dprint.com  | User@123  |

**⚠️ Change admin password immediately in production!**

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── admin/             # Admin dashboard and management
│   ├── products/          # Product listing and details
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout flow
│   ├── orders/            # Order history
│   ├── actions/           # Server actions (auth, product, order)
│   └── api/               # API routes (NextAuth)
├── components/            # React components
│   ├── layout/            # Navbar, cart panel
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities
│   ├── db.ts              # Prisma client
│   ├── auth-server.ts     # Server-side auth helpers
│   ├── email.ts           # Email service
│   └── validations/       # Zod schemas
├── store/                 # Zustand stores (cart)
└── auth/                  # NextAuth configuration
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeding
```

## 📚 Documentation

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Deploy to Vercel in 5 minutes
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Complete production checklist
- **[DEPLOY.md](./DEPLOY.md)** - Detailed deployment guide
- **[SETUP.md](./SETUP.md)** - Full setup instructions
- **[SECURITY.md](./SECURITY.md)** - Security best practices

## 🔒 Production-Ready Features

✅ **Security**
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Password hashing with bcrypt
- Session-based authentication
- Environment variable protection
- SQL injection protection via Prisma

✅ **Performance**
- Image optimization (WebP/AVIF)
- Code splitting and lazy loading
- Optimized package imports
- Compression enabled
- CDN delivery via Vercel

✅ **SEO**
- Dynamic sitemap generation
- Robots.txt configuration
- Open Graph tags
- Twitter Card support
- Semantic HTML structure

✅ **Developer Experience**
- TypeScript for type safety
- ESLint configuration
- Prisma for type-safe database queries
- Hot reload in development
- Comprehensive error handling

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for step-by-step guide.

### Other Platforms
The project can be deployed to any platform supporting Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/3dprintwithsurthi/issues)
- **Documentation**: See docs folder
- **Email**: support@3dprintwithsruthi.com

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Real-time order tracking
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Built with ❤️ for the 3D printing community**

