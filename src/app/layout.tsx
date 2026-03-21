/**
 * Root layout – SessionProvider, conditional navbar, cart (lazy), prefetch
 */
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { CartSidePanelWrapper } from "@/components/layout/cart-side-panel-wrapper";
import { Footer } from "@/components/layout/footer";
import { AnalyticsTracker } from "@/components/analytics-tracker";

const outfit = Outfit({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://3dprintwithsruthi.in'),
  title: {
    default: "3D Print with Sruthi | Custom 3D Print Services",
    template: "%s | Sruthi 3D Print"
  },
  description:
    "Looking for high-quality 3d print services? 3D Print with Sruthi provides custom 3D printing, prototypes, and personalized gifts. Turn your imagination into reality.",
  keywords: [
    "3d print",
    "3d print sruthi",
    "Sruthi 3d print",
    "custom 3d print",
    "3D printing India",
    "personalized 3d gifts",
    "3D printing services",
    "prototypes",
    "custom keychains",
    "3D models",
    "rapid prototyping"
  ],
  authors: [{ name: "Sruthi", url: "https://3dprintwithsruthi.in" }],
  creator: "Sruthi",
  publisher: "3D Print with Sruthi",
  alternates: {
    canonical: '/',
  },
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
    locale: "en_IN",
    url: process.env.NEXTAUTH_URL || 'https://3dprintwithsruthi.in',
    siteName: "Sruthi 3D Print",
    title: "3D Print with Sruthi | Custom 3D Print Services",
    description: "Looking for high-quality 3d print services? 3D Print with Sruthi provides custom 3D printing, prototypes, and personalized gifts.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Sruthi 3D Print Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Print with Sruthi | Custom 3D Print Services",
    description: "Looking for high-quality 3d print services? 3D Print with Sruthi provides custom 3D printing, prototypes, and personalized gifts.",
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
  verification: {
    google: "change-this-to-google-site-verification-code",
  }
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
      <body suppressHydrationWarning={true} className={`${outfit.className} ${outfit.variable}`}>
        <AuthSessionProvider>
          <AnalyticsTracker />
          <ConditionalNavbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <CartSidePanelWrapper />
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
