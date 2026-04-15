"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCleaners } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { CleanerCard } from "@/app/components/CleanerCard";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { MapPin, Star, ShieldCheck, Clock, Search } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: featuredCleaners, isLoading } = useCleaners();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/cleaners?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative pt-16 min-h-[600px] flex items-center"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1721620780493-e905708eba0b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Your Home, Spotless.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Find trusted, professional home cleaners in your area. Book with confidence and enjoy a sparkling clean home.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your city or zip code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-background text-foreground"
                data-testid="input-search"
              />
            </div>
            <Button type="submit" size="lg" className="h-12" data-testid="button-search">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Professionals</h3>
              <p className="text-muted-foreground">
                All cleaners are background-checked and vetted for your peace of mind.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Top-Rated Service</h3>
              <p className="text-muted-foreground">
                Our cleaners maintain high ratings through consistent quality work.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-muted-foreground">
                Book cleaning sessions that fit your schedule, any day of the week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cleaners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="text-featured-title">
                Featured Cleaners
              </h2>
              <p className="text-muted-foreground">
                Top-rated professionals ready to help
              </p>
            </div>
            <Link href="/cleaners" data-testid="link-view-all">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : featuredCleaners && featuredCleaners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-featured-cleaners">
              {featuredCleaners.slice(0, 6).map((cleaner) => (
                <CleanerCard key={cleaner.id} cleaner={cleaner} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No cleaners available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy customers who trust HomeShine for their cleaning needs.
          </p>
          <Link href="/signup" data-testid="link-cta-signup">
            <Button size="lg" variant="secondary">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>HomeShine - Professional Home Cleaning Services</p>
        </div>
      </footer>
    </div>
  );
}
