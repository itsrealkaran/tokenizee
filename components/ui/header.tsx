"use client";

import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";
import { Button } from "@/components/ui/button";
import { LogOut, User, ArrowLeft, Bolt } from "lucide-react";
import { toast } from "react-hot-toast";

export function Header() {
  const router = useRouter();
  const { user, logout } = useGlobal();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => router.push("/feed")}
          >
            <Bolt className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">Tokenizee</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="relative group">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {user.displayName[0]}
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-semibold text-sm">
                    {user.displayName}
                  </span>
                  <span
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(user.walletAddress);
                      toast.success("Address Copied");
                    }}
                  >
                    {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                  </span>
                </div>
              </Button>

              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-background shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
