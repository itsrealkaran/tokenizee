"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="container max-w-2xl px-4 sm:px-6">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Oopsie! 🫣
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground">
              This page is giving main character energy... but it&apos;s not here
            </h2>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            This page is more ghosted than your ex&apos;s DMs. Redirecting you to home in 7 seconds...
          </p>

          <div className="flex justify-center pt-2 sm:pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Take me home, bestie!</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
