"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/use-auth";
import { useBookings } from "@/app/hooks/use-bookings";
import { Navbar } from "@/app/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="h-32 bg-muted rounded mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" data-testid="text-welcome">
              Welcome, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your bookings and account
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-booking-count">
                      {bookings?.length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Total Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {bookings?.filter(b => b.status === "pending").length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${bookings?.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(0) || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Bookings</CardTitle>
              <Link href="/cleaners">
                <Button size="sm" data-testid="button-book-cleaner">
                  Book a Cleaner
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4" data-testid="list-bookings">
                  {bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      data-testid={`booking-${booking.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(booking.date), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.hours} hours</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No bookings yet</p>
                  <Link href="/cleaners">
                    <Button>Find a Cleaner</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
