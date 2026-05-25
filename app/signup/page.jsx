"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/app/hooks/use-auth";
import { Navbar } from "@/app/components/Navbar";
import { AvatarPicker } from "@/app/components/AvatarPicker";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Sparkles, User, Briefcase } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCleaner, setIsCleaner] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await register.mutateAsync({ email, password, name, isCleaner, avatarUrl });
      router.push(isCleaner ? "/become-cleaner" : "/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join HomeShine today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-md" data-testid="text-error">
                  {error}
                </div>
              )}

              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-1">
                <AvatarPicker
                  avatarUrl={avatarUrl}
                  name={name}
                  onChange={setAvatarUrl}
                  size="lg"
                />
                <p className="text-xs text-muted-foreground">Click to add a photo (optional)</p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCleaner(false)}
                  data-testid="button-role-customer"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    !isCleaner
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <User className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium text-sm">Customer</p>
                    <p className="text-xs opacity-70">Book cleaners</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCleaner(true)}
                  data-testid="button-role-cleaner"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    isCleaner
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Briefcase className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium text-sm">Cleaner</p>
                    <p className="text-xs opacity-70">Offer services</p>
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
                data-testid="button-signup"
              >
                {register.isPending
                  ? "Creating account..."
                  : `Sign up as ${isCleaner ? "Cleaner" : "Customer"}`}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
