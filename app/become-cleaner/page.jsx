"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/use-auth";
import { useMyCleanerProfile } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useToast } from "@/app/hooks/use-toast";
import { Sparkles, DollarSign, Clock, MapPin } from "lucide-react";

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

export default function BecomeCleanerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: existingProfile, isLoading: profileLoading } = useMyCleanerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    hourlyRate: "",
    experience: "",
    location: "",
    specialties: [],
  });

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!profileLoading && existingProfile) {
      router.push("/dashboard");
    }
  }, [existingProfile, profileLoading, router]);

  const handleSpecialtyChange = (specialty, checked) => {
    setFormData((prev) => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter((s) => s !== specialty),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/cleaners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate),
          experience: parseInt(formData.experience),
          specialties: formData.specialties,
          location: formData.location,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create profile");
      }

      toast({
        title: "Welcome to HomeShine!",
        description: "Your cleaner profile has been created successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Become a Cleaner
            </h1>
            <p className="text-muted-foreground mt-2">
              Join our community of professional cleaners and start earning
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>
                Fill in your details to get started. You can update these later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about yourself, your experience, and what makes you great at cleaning..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="min-h-[120px]"
                    required
                    data-testid="input-bio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate (PKR)
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="35"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      required
                      data-testid="input-hourly-rate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="3"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                      data-testid="input-experience"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Service Area
                  </Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Specialties (select at least one)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onCheckedChange={(checked) =>
                            handleSpecialtyChange(specialty, checked)
                          }
                          data-testid={`checkbox-${specialty.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <Label
                          htmlFor={specialty}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || formData.specialties.length === 0}
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Creating Profile..." : "Create Cleaner Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
