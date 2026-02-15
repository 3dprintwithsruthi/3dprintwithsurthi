/**
 * Root layout – SessionProvider, conditional navbar, cart (lazy), prefetch
 */
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";

const CartSidePanel = dynamic(
  () => import("@/components/layout/cart-side-panel").then((m) => ({ default: m.CartSidePanel })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "3D Print with Sruthi – Custom 3D Printing Store",
  description:
    "Custom 3D printed products tailored to your needs. From prototypes to personalized gifts, we bring your imagination to life.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "3D Print with Sruthi – Custom 3D Printing Store",
    description: "Custom 3D printed products. Print your ideas into reality.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <ConditionalNavbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <CartSidePanel />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
