/**
 * Root layout – SessionProvider, conditional navbar, cart (lazy), prefetch
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { CartSidePanelWrapper } from "@/components/layout/cart-side-panel-wrapper";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: "3D Print with Sruthi - Custom 3D Printing Services",
    template: "%s | 3D Print with Sruthi"
  },
  description:
    "Custom 3D printed products tailored to your needs. From prototypes to personalized gifts, we bring your imagination to life with high-quality 3D printing services.",
  keywords: [
    "3D printing",
    "custom 3D prints",
    "personalized gifts",
    "3D printing services",
    "prototypes",
    "3D printed products",
    "custom keychains",
    "3D models",
    "rapid prototyping"
  ],
  authors: [{ name: "3D Print with Sruthi" }],
  creator: "3D Print with Sruthi",
  publisher: "3D Print with Sruthi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: "3D Print with Sruthi",
    title: "3D Print with Sruthi – Custom 3D Printing Store",
    description: "Custom 3D printed products. Print your ideas into reality with our professional 3D printing services.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "3D Print with Sruthi Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Print with Sruthi – Custom 3D Printing Store",
    description: "Custom 3D printed products. Print your ideas into reality.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
      <body suppressHydrationWarning={true}>
        <AuthSessionProvider>
          <ConditionalNavbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <CartSidePanelWrapper />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
