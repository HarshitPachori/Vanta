import type { Metadata, Viewport } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vanta.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Vanta — Your inbox, finally quiet.",
    template: "%s | Vanta",
  },
  description:
    "Vanta scans your Gmail, kills newsletters you never read, and rebuilds your favourite ones into one clean daily digest.",
  applicationName: "Vanta",
  authors: [{ name: "Vanta" }],
  keywords: [
    "inbox cleaner",
    "email unsubscribe",
    "newsletter digest",
    "gmail cleaner",
    "inbox zero",
    "email management",
    "vanta",
  ],
  creator: "Vanta",
  publisher: "Vanta",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Vanta",
    title: "Vanta — Your inbox, finally quiet.",
    description:
      "Scan your Gmail, kill the noise, get one clean daily digest of the emails that actually matter.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vanta — inbox cleaner and digest rebuilder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanta — Your inbox, finally quiet.",
    description: "Scan your Gmail, kill the noise, get one clean daily digest.",
    images: ["/og.png"],
    creator: "@vantaapp",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: BASE_URL,
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: "#0F0F12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(jetbrainsMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning>
      <body className="antialiased min-h-dvh bg-[var(--color-base)] text-[var(--color-text-primary)] font-sans">
        {children}
      </body>
    </html>
  );
}
