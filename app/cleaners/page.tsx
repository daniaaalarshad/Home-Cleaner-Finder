"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCleaners } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { CleanerCard } from "@/app/components/CleanerCard";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function CleanersList() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  
  const { data: cleaners, isLoading } = useCleaners({ search: appliedSearch || undefined });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchTerm);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Cleaner</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Browse our network of trusted cleaning professionals
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search by name, city, or specialty" 
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Button type="submit" className="h-12 px-6" data-testid="button-search">
              <MapPin className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                {cleaners?.length || 0} cleaner{cleaners?.length !== 1 ? "s" : ""} found
                {appliedSearch && ` for "${appliedSearch}"`}
              </p>
            </div>

            {cleaners && cleaners.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cleaners.map((cleaner) => (
                  <CleanerCard key={cleaner.id} cleaner={cleaner} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-primary/50" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No cleaners found</h2>
                <p className="text-muted-foreground">
                  {appliedSearch 
                    ? "Try adjusting your search terms" 
                    : "Be the first to join our network!"}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
