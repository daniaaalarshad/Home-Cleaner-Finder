"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/use-auth";
import { useMyCleanerProfile } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { AvatarPicker } from "@/app/components/AvatarPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Mail, User, LayoutDashboard, Search, Star, Pencil, X, Check,
  Lock, MapPin, DollarSign, Clock, FileText, Briefcase,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/hooks/use-toast";

const SPECIALTY_OPTIONS = [
  "Regular Cleaning",
  "Deep Cleaning",
  "Move-in/out Cleaning",
  "Office Cleaning",
  "Eco-friendly Cleaning",
  "Pet-Friendly",
  "Organizing",
  "Window Cleaning",
  "Carpet Cleaning",
  "Kitchen Deep Clean",
  "Bathroom Specialist",
];

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: cleanerProfile, isLoading: cleanerLoading } = useMyCleanerProfile();

  // Account edit state
  const [editingAccount, setEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Cleaner edit state
  const [editingCleaner, setEditingCleaner] = useState(false);
  const [savingCleaner, setSavingCleaner] = useState(false);
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  useEffect(() => {
    if (cleanerProfile) {
      setBio(cleanerProfile.bio || "");
      setHourlyRate(String(cleanerProfile.hourlyRate ?? ""));
      setExperience(String(cleanerProfile.experience ?? ""));
      setLocation(cleanerProfile.location || "");
      setSpecialties(cleanerProfile.specialties || []);
      setAvailable(cleanerProfile.available ?? true);
    }
  }, [cleanerProfile]);

  // ---------- Account handlers ----------
  const startEditingAccount = () => {
    setName(user.name);
    setEmail(user.email);
    setCurrentPassword("");
    setNewPassword("");
    setChangingPassword(false);
    setEditingAccount(true);
  };

  const cancelEditingAccount = () => {
    setEditingAccount(false);
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    try {
      const body = { name, email, avatarUrl };
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
      setEditingAccount(false);
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Account updated", description: "Your account details have been saved." });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingAccount(false);
    }
  };

  // ---------- Cleaner handlers ----------
  const startEditingCleaner = () => {
    setBio(cleanerProfile.bio || "");
    setHourlyRate(String(cleanerProfile.hourlyRate ?? ""));
    setExperience(String(cleanerProfile.experience ?? ""));
    setLocation(cleanerProfile.location || "");
    setSpecialties(cleanerProfile.specialties || []);
    setAvailable(cleanerProfile.available ?? true);
    setEditingCleaner(true);
  };

  const cancelEditingCleaner = () => {
    setEditingCleaner(false);
  };

  const toggleSpecialty = (s) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSaveCleaner = async () => {
    if (specialties.length === 0) {
      toast({ title: "Error", description: "Select at least one specialty.", variant: "destructive" });
      return;
    }
    setSavingCleaner(true);
    try {
      const res = await fetch(`/api/cleaners/${cleanerProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          hourlyRate: parseFloat(hourlyRate),
          experience: parseInt(experience),
          location,
          specialties,
          available,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      await queryClient.invalidateQueries({ queryKey: ["my-cleaner-profile"] });
      setEditingCleaner(false);
      toast({ title: "Service profile updated", description: "Your cleaner profile has been saved." });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingCleaner(false);
    }
  };

  // ---------- Loading / guard ----------
  if (userLoading || (user?.isCleaner && cleanerLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 bg-muted rounded-full mx-auto" />
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
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
            <div className="flex flex-col items-center gap-2 mb-4">
              <AvatarPicker
                avatarUrl={avatarUrl}
                name={user.name}
                onChange={async (newUrl) => {
                  setAvatarUrl(newUrl);
                  const res = await fetch("/api/auth/user", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: user.name, email: user.email, avatarUrl: newUrl }),
                  });
                  if (res.ok) {
                    await queryClient.invalidateQueries({ queryKey: ["auth"] });
                    toast({ title: "Photo updated" });
                  }
                }}
                size="lg"
              />
              <p className="text-xs text-muted-foreground">Click photo to change</p>
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-profile-name">{user.name}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.isCleaner ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
              }`}
              data-testid="badge-account-type"
            >
              {user.isCleaner ? "Cleaner" : "Customer"}
            </span>
          </div>

          {/* ── Account Details card ── */}
          <Card className="mb-6" data-testid="card-profile-details">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Account Details</CardTitle>
              {!editingAccount ? (
                <Button variant="outline" size="sm" onClick={startEditingAccount} data-testid="button-edit-profile">
                  <Pencil className="h-4 w-4 mr-2" />Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEditingAccount} disabled={savingAccount} data-testid="button-cancel-edit">
                    <X className="h-4 w-4 mr-1" />Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveAccount} disabled={savingAccount} data-testid="button-save-profile">
                    <Check className="h-4 w-4 mr-1" />{savingAccount ? "Saving…" : "Save"}
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
                  {editingAccount ? (
                    <div className="space-y-1">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-edit-name" />
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
                  {editingAccount ? (
                    <div className="space-y-1">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-edit-email" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-medium" data-testid="text-detail-email">{user.email}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Password — only in edit mode */}
              {editingAccount && (
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
                            <Input id="current-password" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} data-testid="input-current-password" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} data-testid="input-new-password" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Cleaner Service Profile card ── */}
          {user.isCleaner && cleanerProfile && (
            <Card className="mb-6" data-testid="card-cleaner-profile">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Service Profile</CardTitle>
                {!editingCleaner ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {cleanerProfile.rating?.toFixed(1) || "5.0"}
                      <span className="text-xs">({cleanerProfile.reviewCount || 0} reviews)</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={startEditingCleaner} data-testid="button-edit-cleaner">
                      <Pencil className="h-4 w-4 mr-2" />Edit
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEditingCleaner} disabled={savingCleaner} data-testid="button-cancel-cleaner">
                      <X className="h-4 w-4 mr-1" />Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveCleaner} disabled={savingCleaner} data-testid="button-save-cleaner">
                      <Check className="h-4 w-4 mr-1" />{savingCleaner ? "Saving…" : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Bio */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    {editingCleaner ? (
                      <div className="space-y-1">
                        <Label htmlFor="edit-bio">About You</Label>
                        <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" data-testid="input-edit-bio" />
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-sm" data-testid="text-detail-bio">{cleanerProfile.bio || "—"}</p>
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Rate + Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      {editingCleaner ? (
                        <div className="space-y-1">
                          <Label htmlFor="edit-rate">Hourly Rate (PKR)</Label>
                          <Input id="edit-rate" type="number" min="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} data-testid="input-edit-rate" />
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">Hourly Rate</p>
                          <p className="font-medium" data-testid="text-detail-rate">PKR {cleanerProfile.hourlyRate}/hr</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      {editingCleaner ? (
                        <div className="space-y-1">
                          <Label htmlFor="edit-exp">Years of Experience</Label>
                          <Input id="edit-exp" type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} data-testid="input-edit-experience" />
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="font-medium" data-testid="text-detail-experience">{cleanerProfile.experience} yr{cleanerProfile.experience !== 1 ? "s" : ""}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    {editingCleaner ? (
                      <div className="space-y-1">
                        <Label htmlFor="edit-location">Service Area / City</Label>
                        <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Karachi" data-testid="input-edit-location" />
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">Service Area</p>
                        <p className="font-medium" data-testid="text-detail-location">{cleanerProfile.location || "—"}</p>
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Specialties */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    {editingCleaner ? (
                      <div className="space-y-2">
                        <Label>Specialties (select at least one)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {SPECIALTY_OPTIONS.map((s) => (
                            <div key={s} className="flex items-center gap-2">
                              <Checkbox
                                id={`spec-${s}`}
                                checked={specialties.includes(s)}
                                onCheckedChange={() => toggleSpecialty(s)}
                                data-testid={`checkbox-${s.toLowerCase().replace(/\s+/g, "-")}`}
                              />
                              <Label htmlFor={`spec-${s}`} className="text-sm font-normal cursor-pointer">{s}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">Specialties</p>
                        <div className="flex flex-wrap gap-1.5 mt-1" data-testid="text-detail-specialties">
                          {(cleanerProfile.specialties || []).map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Availability */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Availability</p>
                      <p className="font-medium" data-testid="text-detail-available">
                        {editingCleaner ? (available ? "Available for bookings" : "Not available") : (cleanerProfile.available ? "Available for bookings" : "Not available")}
                      </p>
                    </div>
                    {editingCleaner && (
                      <button
                        type="button"
                        onClick={() => setAvailable(!available)}
                        data-testid="button-toggle-available"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${available ? "bg-primary" : "bg-muted-foreground/30"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${available ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* View public profile link */}
                {!editingCleaner && (
                  <div className="pt-1">
                    <Link href={`/cleaners/${cleanerProfile.id}`}>
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-view-cleaner-profile">
                        View Public Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Quick links ── */}
          <Card data-testid="card-quick-links">
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-go-dashboard">
                  <LayoutDashboard className="h-4 w-4" />Go to Dashboard
                </Button>
              </Link>
              <Link href="/cleaners">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-find-cleaners">
                  <Search className="h-4 w-4" />Find Cleaners
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
