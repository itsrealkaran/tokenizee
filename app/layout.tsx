import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/global-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tokenizee",
  description: "Join our community of content creators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
          <ThemeProvider>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
