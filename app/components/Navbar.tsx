"use client";

import Link from "next/link";
import { useAuth, useLogout } from "@/app/hooks/use-auth";
import { Button } from "@/app/components/ui/button";
import { Sparkles, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">HomeShine</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/cleaners" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-find-cleaners"
            >
              Find Cleaners
            </Link>
            
            {isLoading ? (
              <div className="w-20 h-9 bg-muted rounded-md animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {!user.isCleaner && (
                  <Link 
                    href="/become-cleaner" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="link-become-cleaner"
                  >
                    Become a Cleaner
                  </Link>
                )}
                <Link href="/dashboard" data-testid="link-dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/signup" data-testid="link-signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link 
                href="/cleaners" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Cleaners
              </Link>
              {user ? (
                <>
                  {!user.isCleaner && (
                    <Link 
                      href="/become-cleaner" 
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Become a Cleaner
                    </Link>
                  )}
                  <Link 
                    href="/dashboard" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
