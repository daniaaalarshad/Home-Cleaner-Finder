"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/use-auth";
import { useMyCleanerProfile } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Mail, User, LayoutDashboard, Search, Star, Pencil, X, Check, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/hooks/use-toast";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: cleanerProfile, isLoading: cleanerLoading } = useMyCleanerProfile();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const startEditing = () => {
    setName(user.name);
    setEmail(user.email);
    setCurrentPassword("");
    setNewPassword("");
    setChangingPassword(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { name, email };
      if (changingPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      setEditing(false);
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 bg-muted rounded-full mx-auto" />
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-48 bg-muted rounded" />
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

          {/* Account details / edit card */}
          <Card className="mb-6" data-testid="card-profile-details">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Account Details</CardTitle>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  data-testid="button-edit-profile"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={saving}
                    data-testid="button-cancel-edit"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    data-testid="button-save-profile"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-1">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="input-edit-name"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-medium" data-testid="text-detail-name">{user.name}</p>
                    </>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-1">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="input-edit-email"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-medium" data-testid="text-detail-email">{user.email}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Password change — only in edit mode */}
              {editing && (
                <>
                  <hr className="border-border" />
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Password</p>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => setChangingPassword(!changingPassword)}
                          data-testid="button-toggle-password"
                        >
                          {changingPassword ? "Cancel password change" : "Change password"}
                        </button>
                      </div>
                      {changingPassword && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              placeholder="Enter current password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              data-testid="input-current-password"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="At least 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              data-testid="input-new-password"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cleaner profile card */}
          {user.isCleaner && !cleanerLoading && cleanerProfile && (
            <Card className="mb-6" data-testid="card-cleaner-profile">
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
          <Card data-testid="card-quick-links">
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
