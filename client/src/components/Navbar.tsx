import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Sparkles className="h-6 w-6" />
          <span className="font-display text-xl font-bold tracking-tight">HomeShine</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cleaners">
            <Button variant="ghost" className="text-foreground/80 hover:text-primary">
              Find Cleaners
            </Button>
          </Link>

          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={() => logout()}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => window.location.href = '/api/login'}>
                  Login / Sign Up
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
