"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/use-auth";
import { useMyCleanerProfile } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Mail, User, LayoutDashboard, Search, Star } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: cleanerProfile, isLoading: cleanerLoading } = useMyCleanerProfile();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-24 w-24 bg-muted rounded-full mx-auto mb-6" />
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Avatar & name header */}
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              data-testid="avatar-initial"
            >
              <span className="text-4xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-profile-name">
              {user.name}
            </h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.isCleaner
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-secondary-foreground"
              }`}
              data-testid="badge-account-type"
            >
              {user.isCleaner ? "Cleaner" : "Customer"}
            </span>
          </div>

          {/* Account details card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium" data-testid="text-detail-name">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium" data-testid="text-detail-email">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cleaner profile card — only shown for cleaners */}
          {user.isCleaner && !cleanerLoading && cleanerProfile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Cleaner Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className="font-medium">{cleanerProfile.rating?.toFixed(1) || "5.0"} rating</p>
                      <p className="text-sm text-muted-foreground">{cleanerProfile.reviewCount || 0} reviews</p>
                    </div>
                  </div>
                  <Link href={`/cleaners/${cleanerProfile.id}`}>
                    <Button variant="outline" size="sm" data-testid="button-view-cleaner-profile">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-go-dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/cleaners">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-find-cleaners">
                  <Search className="h-4 w-4" />
                  Find Cleaners
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
