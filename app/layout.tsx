import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "@/context/notification-context";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { ThemeColor } from "@/components/providers/theme-color";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Tokenizee",
  description:
    "A decentralized social platform for content creators and their communities",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tokenizee",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tokenizee" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <GlobalProvider>
          <NotificationProvider>
            <ThemeProvider>
              <ThemeColor />
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <main>{children}</main>
              <PWAInstallPrompt />
              <Toaster />
            </ThemeProvider>
          </NotificationProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
