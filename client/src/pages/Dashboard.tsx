import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useCreateCleaner, useUpdateCleaner, useCleaners } from "@/hooks/use-cleaners";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCleanerSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, DollarSign, User as UserIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  // Fetch all cleaners to find if current user is a cleaner
  // In a real app, /api/user would likely return this info or /api/cleaners/me
  const { data: cleaners } = useCleaners();
  
  const myCleanerProfile = cleaners?.find(c => c.userId === user?.id);
  const isCleaner = !!myCleanerProfile;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container px-4 mx-auto py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {user.firstName}</h1>
          <p className="text-muted-foreground">Manage your bookings and profile here.</p>
        </div>

        <Tabs defaultValue={isCleaner ? "requests" : "bookings"} className="space-y-8">
          <TabsList className="bg-background border p-1 h-auto rounded-xl shadow-sm">
            <TabsTrigger value="bookings" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              My Bookings
            </TabsTrigger>
            {isCleaner && (
              <TabsTrigger value="requests" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Client Requests
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              {isCleaner ? "Cleaner Profile" : "Become a Cleaner"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Your Upcoming Cleanings</h2>
            {bookingsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings?.filter(b => b.customerId === user.id).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="customer" />
                ))}
                {bookings?.filter(b => b.customerId === user.id).length === 0 && (
                  <div className="col-span-full p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                    <p className="text-muted-foreground mb-4">You haven't booked any cleanings yet.</p>
                    <Button onClick={() => window.location.href = "/cleaners"}>Find a Cleaner</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {isCleaner && (
            <TabsContent value="requests" className="space-y-6">
               <h2 className="text-xl font-semibold mb-4">Requests from Clients</h2>
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings?.filter(b => b.cleanerId === myCleanerProfile?.id).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="cleaner" />
                ))}
                {bookings?.filter(b => b.cleanerId === myCleanerProfile?.id).length === 0 && (
                  <div className="col-span-full p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                    <p className="text-muted-foreground">No booking requests yet.</p>
                  </div>
                )}
               </div>
            </TabsContent>
          )}

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <CleanerProfileForm existingProfile={myCleanerProfile} userId={user.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingCard({ booking, type }: { booking: any, type: "customer" | "cleaner" }) {
  const updateStatus = useUpdateBookingStatus();
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={`${statusColors[booking.status as keyof typeof statusColors]} border`}>
            {booking.status.toUpperCase()}
          </Badge>
          <div className="text-sm text-muted-foreground font-medium">
            {format(new Date(booking.date), "MMM d, yyyy")}
          </div>
        </div>
        <CardTitle className="text-lg">
          {type === "customer" 
            ? `Cleaning with ${booking.cleaner?.name || "Cleaner"}`
            : `Request from Customer #${booking.customerId}`
          }
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(booking.date), "h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <span>{booking.address}</span>
        </div>
        {booking.notes && (
          <div className="p-3 bg-muted/50 rounded-lg text-muted-foreground italic text-xs">
            "{booking.notes}"
          </div>
        )}
        
        {type === "cleaner" && booking.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: booking.id, status: "confirmed" })}
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-red-600 hover:bg-red-50 border-red-100"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: booking.id, status: "cancelled" })}
            >
              Decline
            </Button>
          </div>
        )}

        {type === "cleaner" && booking.status === "confirmed" && (
          <Button 
             size="sm"
             className="w-full"
             disabled={updateStatus.isPending}
             onClick={() => updateStatus.mutate({ id: booking.id, status: "completed" })}
          >
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CleanerProfileForm({ existingProfile, userId }: { existingProfile?: any, userId: string }) {
  const { toast } = useToast();
  const createCleaner = useCreateCleaner();
  const updateCleaner = useUpdateCleaner();
  
  // Need to define schema manually for form as insertCleanerSchema excludes some fields we need to handle or includes ones we don't
  const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    rate: z.coerce.number().min(10, "Minimum rate is $10/hr"),
    city: z.string().min(2, "City is required"),
    experienceYears: z.coerce.number().min(0),
    imageUrl: z.string().optional(),
    specialties: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingProfile?.name || "",
      bio: existingProfile?.bio || "",
      rate: existingProfile?.rate || 25,
      city: existingProfile?.city || "",
      experienceYears: existingProfile?.experienceYears || 0,
      imageUrl: existingProfile?.imageUrl || "",
      specialties: existingProfile?.specialties?.join(", ") || "Deep Cleaning, Move-out, Organization",
    },
  });

  const onSubmit = (data: any) => {
    // Array transform happens in zod, but types need to match
    const payload = { ...data };
    
    if (existingProfile) {
      updateCleaner.mutate({ id: existingProfile.id, ...payload }, {
        onSuccess: () => toast({ title: "Profile Updated", description: "Your changes have been saved." })
      });
    } else {
      createCleaner.mutate(payload, {
        onSuccess: () => toast({ title: "Profile Created", description: "You are now listed as a cleaner!" })
      });
    }
  };

  const isPending = createCleaner.isPending || updateCleaner.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingProfile ? "Edit Profile" : "Become a Cleaner"}</CardTitle>
        <CardDescription>
          {existingProfile 
            ? "Update your public profile information." 
            : "Set up your profile to start receiving bookings."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Experience</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties (comma separated)</FormLabel>
                  <FormControl><Input placeholder="Deep Cleaning, Laundry, Windows..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell clients about your experience and style..." 
                      className="h-32 resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingProfile ? "Save Changes" : "Create Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
