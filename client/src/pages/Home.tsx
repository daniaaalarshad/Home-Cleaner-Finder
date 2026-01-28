import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCleaners } from "@/hooks/use-cleaners";
import { Navbar } from "@/components/Navbar";
import { CleanerCard } from "@/components/CleanerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, ShieldCheck, Clock } from "lucide-react";
import heroImage from "@/assets/images/hero-living-room.jpg";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: featuredCleaners, isLoading } = useCleaners();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/cleaners?search=${encodeURIComponent(search)}`);
    } else {
      setLocation("/cleaners");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            alt="Pristine living room" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-md">
            Your Home, <span className="text-primary-foreground text-accent">Spotless.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-sm font-light leading-relaxed">
            Connect with top-rated local cleaners for a sparkling home. 
            Trusted professionals, transparent pricing.
          </p>

          <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-transform duration-300">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Enter your city or zip code" 
                  className="pl-10 h-14 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground/70"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 text-lg font-medium rounded-xl">
                Find Cleaners
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vetted Professionals</h3>
              <p className="text-muted-foreground">Every cleaner undergoes a strict background check and interview process.</p>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Top-Rated Service</h3>
              <p className="text-muted-foreground">Browse reviews and ratings to find the perfect match for your needs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Scheduling</h3>
              <p className="text-muted-foreground">Book instantly for tomorrow or schedule recurring cleans with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cleaners */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Featured Cleaners</h2>
              <p className="text-muted-foreground text-lg">Highly rated professionals near you</p>
            </div>
            <Link href="/cleaners">
              <Button variant="outline" className="hidden md:flex">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCleaners?.slice(0, 4).map((cleaner) => (
                <CleanerCard key={cleaner.id} cleaner={cleaner} />
              ))}
              {(!featuredCleaners || featuredCleaners.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No featured cleaners found. Be the first to join!
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/cleaners">
              <Button variant="outline" className="w-full">View All Cleaners</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container px-4 mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Are you a cleaning professional?</h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
            Join our network, set your own rates, and grow your business with HomeShine.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-xl text-primary font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Become a Cleaner
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-white py-12 border-t mt-auto">
        <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="font-display text-xl font-bold">HomeShine</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 HomeShine. All rights reserved.
          </div>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
