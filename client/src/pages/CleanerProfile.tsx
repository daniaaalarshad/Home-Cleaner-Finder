import { useRoute } from "wouter";
import { useCleaner } from "@/hooks/use-cleaners";
import { Navbar } from "@/components/Navbar";
import { BookingDialog } from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Star, ShieldCheck, CalendarCheck } from "lucide-react";

export default function CleanerProfile() {
  const [, params] = useRoute("/cleaners/:id");
  const id = parseInt(params?.id || "0");
  const { data: cleaner, isLoading } = useCleaner(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 mx-auto py-12">
          <Skeleton className="h-[400px] w-full rounded-3xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Cleaner Not Found</h1>
            <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Profile Header */}
      <div className="bg-muted/30 border-b">
        <div className="container px-4 mx-auto py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Image */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                {cleaner.imageUrl ? (
                  <img 
                    src={cleaner.imageUrl} 
                    alt={cleaner.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                    <Star className="w-20 h-20 opacity-20" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">{cleaner.name}</h1>
                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-muted-foreground text-lg">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-5 h-5" />
                    {cleaner.city}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-5 h-5" />
                    {cleaner.experienceYears} Years Exp.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {cleaner.specialties?.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="px-4 py-1.5 text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="text-3xl font-bold text-primary">
                  ${cleaner.rate}<span className="text-base font-normal text-muted-foreground">/hr</span>
                </div>
                <BookingDialog cleaner={cleaner}>
                  <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-lg shadow-lg shadow-primary/20">
                    Book Now
                  </Button>
                </BookingDialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Details */}
      <div className="container px-4 mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-display">About Me</h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {cleaner.bio}
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t">
              <h2 className="text-2xl font-bold font-display">Why Hire Me?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-primary" /> Reliable
                  </h4>
                  <p className="text-sm text-muted-foreground">Always on time and ready to work.</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> Detail Oriented
                  </h4>
                  <p className="text-sm text-muted-foreground">I don't miss a spot, guaranteed.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Availability</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Most bookings are confirmed within 24 hours. Check calendar for available slots when booking.
              </p>
              <BookingDialog cleaner={cleaner}>
                <Button className="w-full" variant="outline">
                  Check Availability
                </Button>
              </BookingDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
