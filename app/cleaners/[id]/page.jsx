"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCleaner } from "@/app/hooks/use-cleaners";
import { useAuth } from "@/app/hooks/use-auth";
import { useCreateBooking } from "@/app/hooks/use-bookings";
import { Navbar } from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Star, MapPin, Clock, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function CleanerProfilePage({ params }) {
  const { id } = use(params);
  const cleanerId = parseInt(id);
  const router = useRouter();
  
  const { data: cleaner, isLoading } = useCleaner(cleanerId);
  const { data: user } = useAuth();
  const createBooking = useCreateBooking();
  
  const [showBooking, setShowBooking] = useState(false);
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(2);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await createBooking.mutateAsync({
        cleanerId,
        date,
        hours,
        address,
        notes: notes || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create booking");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4" />
            <div className="h-64 bg-muted rounded mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Cleaner Not Found</h1>
          <Link href="/cleaners">
            <Button>Back to Cleaners</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = cleaner.hourlyRate * hours;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/cleaners" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cleaners
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {cleaner.imageUrl ? (
                        <img 
                          src={cleaner.imageUrl} 
                          alt={cleaner.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {cleaner.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2" data-testid="text-cleaner-name">
                        {cleaner.user.name}
                      </h1>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{cleaner.rating?.toFixed(1) || "5.0"}</span>
                          <span className="text-muted-foreground">({cleaner.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                      {cleaner.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{cleaner.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{cleaner.experience} years of experience</span>
                      </div>
                    </div>
                  </div>

                  {cleaner.bio && (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">About</h2>
                      <p className="text-muted-foreground">{cleaner.bio}</p>
                    </div>
                  )}

                  {cleaner.specialties && cleaner.specialties.length > 0 && (
                    <div className="mt-6">
                      <h2 className="font-semibold mb-2">Specialties</h2>
                      <div className="flex flex-wrap gap-2">
                        {cleaner.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-secondary rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Booking</span>
                    <span className="text-primary" data-testid="text-hourly-rate">
                      ${cleaner.hourlyRate}/hr
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showBooking ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowBooking(true)}
                      data-testid="button-book-now"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      {error && (
                        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-md">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="date">Date & Time</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          data-testid="input-date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hours">Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="1"
                          max="12"
                          value={hours}
                          onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                          required
                          data-testid="input-hours"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="123 Main St, City"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          data-testid="input-address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                          id="notes"
                          type="text"
                          placeholder="Special instructions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          data-testid="input-notes"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold mb-4">
                          <span>Total</span>
                          <span className="text-primary" data-testid="text-total-price">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={createBooking.isPending}
                          data-testid="button-confirm-booking"
                        >
                          {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
