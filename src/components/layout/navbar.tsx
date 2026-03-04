"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LayoutDashboard, LogOut, Menu, X, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session, status } = useSession();
  const { items, openCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${scrolled
          ? "bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-sm py-2"
          : "bg-white border-transparent py-4"
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0" prefetch>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 overflow-hidden text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100/50 shadow-inner p-1">
            <Image
              src="/logo.png"
              alt="Sruthi 3D Print Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              3D PRINT
            </span>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase -mt-1">
              with Sruthi
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation & Search */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center max-w-2xl">
          <nav className="flex items-center gap-6">
            <Link
              href="/products"
              prefetch
              className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${pathname?.startsWith('/products') ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              Shop
            </Link>
            {session && (
              <Link
                href="/orders"
                prefetch
                className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${pathname?.startsWith('/orders') ? 'text-indigo-600' : 'text-gray-600'}`}
              >
                My Orders
              </Link>
            )}
          </nav>

          <form action="/products" method="GET" className="flex-1 max-w-sm">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="search"
                name="q"
                placeholder="Search for models, accessories..."
                className="w-full rounded-full border-0 bg-gray-100/80 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200/50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all outline-none"
              />
            </div>
          </form>
        </div>

        {/* Right: Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {status === "loading" ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-gray-100" />
          ) : session ? (
            <>
              {(session.user as { role?: string })?.role === "ADMIN" && (
                <Button asChild size="sm" variant="outline" className="rounded-full border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}

              <Button asChild variant="ghost" size="sm" className="rounded-full font-medium hover:bg-gray-100">
                <Link href="/account">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  {session.user?.name?.split(' ')[0] ?? "Profile"}
                </Link>
              </Button>

              <button
                onClick={openCart}
                className="relative flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {count}
                  </span>
                )}
              </button>

              <div className="h-6 w-px bg-gray-200 mx-1" />

              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="rounded-full font-medium hover:bg-gray-100">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium px-6">
                <Link href="/register">Sign up</Link>
              </Button>
              <button
                onClick={openCart}
                className="relative flex items-center justify-center p-2 ml-1 rounded-full text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={openCart}
            className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 -translate-y-0 translate-x-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-y-auto max-h-[calc(100vh-80px)] origin-top animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-6 space-y-6">

            {/* Mobile Search */}
            <form action="/products" method="GET">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  name="q"
                  placeholder="Search products..."
                  className="w-full rounded-xl bg-gray-50 py-3.5 pl-10 pr-4 text-base text-gray-900 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2">
              <Link
                href="/products"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Package className="h-5 w-5" />
                Shop All Products
              </Link>

              {session && (
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  My Orders History
                </Link>
              )}
            </nav>

            <div className="h-px bg-gray-100" />

            {/* Mobile Auth Actions */}
            <div className="px-2">
              {status === "loading" ? (
                <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
              ) : session ? (
                <div className="space-y-3">
                  {/* Mobile User Profile Summary */}
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{session.user?.name}</span>
                      <span className="text-xs text-gray-500">{session.user?.email}</span>
                    </div>
                  </div>

                  {(session.user as { role?: string })?.role === "ADMIN" && (
                    <Button asChild className="w-full justify-start rounded-xl h-12 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none shadow-none">
                      <Link href="/admin">
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full justify-start rounded-xl h-12 border-gray-200">
                    <Link href="/account">
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      Manage Account
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full rounded-xl bg-indigo-600 h-12 text-base font-semibold">
                    <Link href="/register">Create an Account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-xl h-12 text-base font-semibold border-gray-200">
                    <Link href="/login">Log in securely</Link>
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
