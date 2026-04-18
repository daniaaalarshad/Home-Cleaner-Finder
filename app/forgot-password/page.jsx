"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { KeyRound, ArrowLeft, Copy, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetLink(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResetLink(data.resetLink);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resetLink) return;
    navigator.clipboard.writeText(window.location.origin + resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll generate a reset link for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetLink ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-md" data-testid="text-error">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-send-reset"
                >
                  {loading ? "Generating link…" : "Generate Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4" data-testid="reset-link-section">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                    Reset link ready!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Use the link below to set your new password. It expires in 1 hour.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                  <Link
                    href={resetLink}
                    className="text-sm text-primary hover:underline truncate flex-1"
                    data-testid="link-reset"
                  >
                    {typeof window !== "undefined" ? window.location.origin : ""}{resetLink}
                  </Link>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-copy-link"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Link href={resetLink}>
                  <Button className="w-full" data-testid="button-go-reset">
                    Go to Reset Page
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => { setResetLink(null); setEmail(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center mt-2"
                >
                  Try a different email
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                data-testid="link-back-login"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
