import { useState } from "react";
import { useLocation } from "wouter";
import { useCleaners } from "@/hooks/use-cleaners";
import { Navbar } from "@/components/Navbar";
import { CleanerCard } from "@/components/CleanerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function CleanersList() {
  const [location] = useLocation();
  
  // Parse query params manually since wouter doesn't have useSearchParams
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const { data: cleaners, isLoading } = useCleaners({
    search: debouncedSearch || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 mx-auto py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-display font-bold text-center mb-8">Find Your Perfect Cleaner</h1>
          
          <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, city, or specialty..." 
                className="pl-10 h-12 text-lg shadow-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {cleaners && cleaners.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {cleaners.map((cleaner) => (
                  <CleanerCard key={cleaner.id} cleaner={cleaner} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                <h3 className="text-xl font-bold mb-2">No cleaners found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search terms or location.</p>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setDebouncedSearch(""); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
