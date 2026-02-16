/**
 * Middleware – role-based protection
 * - /admin/* only for ADMIN
 * - /orders, /checkout require any authenticated user
 * - Session-based; no token logic in frontend
 */
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Authorization handled in callbacks.authorized
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/admin")) return token?.role === "ADMIN";
        if (path === "/orders" || path === "/cart" || path.startsWith("/checkout")) return !!token;
        return true;
      },
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/orders", "/cart", "/checkout"],
};
