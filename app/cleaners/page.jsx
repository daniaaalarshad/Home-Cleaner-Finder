"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCleaners } from "@/app/hooks/use-cleaners";
import { Navbar } from "@/app/components/Navbar";
import { CleanerCard } from "@/app/components/CleanerCard";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";

export default function CleanersPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const { data: cleaners, isLoading } = useCleaners(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4" data-testid="text-page-title">Find Cleaners</h1>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : cleaners && cleaners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-cleaners">
              {cleaners.map((cleaner) => (
                <CleanerCard key={cleaner.id} cleaner={cleaner} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {search ? `No cleaners found matching "${search}"` : "No cleaners available yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
