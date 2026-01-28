"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/use-auth";
import { Button } from "@/app/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Sparkles className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">HomeShine</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cleaners">
            <Button variant="ghost" className="text-foreground/80 hover:text-primary" data-testid="button-nav-cleaners">
              Find Cleaners
            </Button>
          </Link>

          {mounted && !isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" data-testid="button-nav-dashboard">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={() => logout()} data-testid="button-nav-logout">
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" data-testid="button-nav-login">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button data-testid="button-nav-signup">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
