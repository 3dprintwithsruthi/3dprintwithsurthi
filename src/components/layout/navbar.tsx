"use client";

/**
 * Glass navbar – custom logo (final_logo), gradient text, search, cart, user
 */
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function Navbar() {
  const { data: session, status } = useSession();
  const { items, openCart } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo – gradient box + logo image + 3D PRINT / with Sruthi */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0" prefetch>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 overflow-hidden p-1">
            <Image
              src="/logo.png"
              alt="3D Print with Sruthi"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="relative pb-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              3D PRINT
            </span>
            <span className="absolute bottom-0 right-0 text-xs font-semibold text-gray-600">
              with Sruthi
            </span>
          </div>
        </Link>

        {/* Center: nav links + search (on store) */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center max-w-xl">
          <Link
            href="/products"
            prefetch
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
          >
            Products
          </Link>
          {session && (
            <Link
              href="/orders"
              prefetch
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              Orders
            </Link>
          )}
          <form action="/products" method="GET" className="flex-1 max-w-xs">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
              />
            </div>
          </form>
        </nav>

        {/* Right: cart, admin, user, logout */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : session ? (
            <>
              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {count}
                  </span>
                )}
              </Link>
              {(session.user as { role?: string })?.role === "ADMIN" && (
                <Link href="/admin">
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/orders">
                <Button variant="outline" size="sm" className="rounded-xl border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100">
                  <User className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">{session.user?.name ?? "Account"}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-xl" title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
