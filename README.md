# 3D Print with Sruthi – Custom 3D Printing Store

Production-ready ecommerce application built with **Next.js 14 (App Router)**, **TypeScript**, **Supabase (PostgreSQL)**, **Prisma**, and **NextAuth**.

## Features

- **Auth**: Single login for Admin and User; registration with secure password hashing (bcrypt); session-based (NextAuth).
- **Store**: Landing (hero, featured, search), product listing (grid, pagination, sort, filter), product detail (images, video, custom fields), cart (side panel), checkout (address,payment), order history.
- **Orders**: Place order → status Pending, inventory auto-decrease; admin can Accept, Reject, InProgress, Shipped, Delivered; each status change sends HTML email via Nodemailer (Gmail SMTP).
- **Admin** (`/admin`): Dashboard (counts, revenue, orders by status), Products (CRUD, images, video, custom fields, low stock), Orders (list, custom inputs, status update), Customers (list, order count), Analytics (most sold, revenue, low stock).

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL), Prisma ORM
- NextAuth (Credentials, session)
- Zod, React Hook Form, Nodemailer, Zustand (cart)

## Quick start

1. **Install**: `npm install --legacy-peer-deps`
2. **Env**: Copy `.env.example` to `.env`; set `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (and SMTP for emails).
3. **DB**: `npx prisma generate && npx prisma db push`
4. **Seed**: `npm run db:seed`
5. **Run**: `npm run dev`

See **[SETUP.md](./SETUP.md)** for full setup (Supabase, Gmail SMTP) and **Vercel deployment** steps.

## Seed credentials

| Role | Email             | Password  |
|------|-------------------|-----------|
| Admin | admin@3dprint.com | Admin@123 |
| User  | user@3dprint.com  | User@123  |

## Project structure (main)

- `src/app/` – Pages (/, /login, /register, /products, /products/[id], /checkout, /orders, /admin/*)
- `src/app/actions/` – Server actions (auth, product, order)
- `src/auth/` – NextAuth config and API route
- `src/components/` – Navbar, cart panel, UI components
- `src/lib/` – DB, validations, email, auth-server
- `src/store/` – Cart (Zustand)
- `prisma/` – Schema and seed
