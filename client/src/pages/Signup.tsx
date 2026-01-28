import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Home, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  const benefits = [
    "Find trusted, verified cleaners",
    "Book appointments in seconds",
    "Secure payment processing",
    "24/7 customer support",
  ];

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
            Start Your Journey to a Cleaner Home
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of happy customers who trust HomeShine for their cleaning needs.
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white/90" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
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
              <CardTitle className="text-2xl font-display">Create Account</CardTitle>
              <CardDescription className="text-base">
                Sign up to start booking cleaners today
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                onClick={handleSignup}
                className="w-full h-12 text-lg font-medium"
                data-testid="button-signup"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer font-medium" data-testid="link-login">
                    Sign in
                  </span>
                </Link>
              </p>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              {/* Mobile benefits */}
              <div className="lg:hidden mt-8 pt-6 border-t">
                <p className="text-sm font-medium text-foreground mb-4 text-center">Why HomeShine?</p>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
