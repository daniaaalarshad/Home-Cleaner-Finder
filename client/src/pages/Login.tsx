import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Home } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-10 w-10" />
            <span className="text-3xl font-display font-bold">HomeShine</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-6">
            Welcome Back to a Cleaner Home
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Sign in to manage your bookings, connect with trusted cleaners, and keep your home sparkling.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
            </div>
            <span className="text-sm">Join 1,000+ happy customers</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8" data-testid="link-home">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-8 w-8" />
                  <span className="text-2xl font-display font-bold">HomeShine</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-display">Sign In</CardTitle>
              <CardDescription className="text-base">
                Access your account to manage bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                onClick={handleLogin}
                className="w-full h-12 text-lg font-medium"
                data-testid="button-login"
              >
                Continue to Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-primary hover:underline cursor-pointer font-medium" data-testid="link-signup">
                    Sign up
                  </span>
                </Link>
              </p>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
