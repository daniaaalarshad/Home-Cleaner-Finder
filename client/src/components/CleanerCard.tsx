import { type Cleaner } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";

interface CleanerCardProps {
  cleaner: Cleaner;
}

export function CleanerCard({ cleaner }: CleanerCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {cleaner.imageUrl ? (
          <img 
            src={cleaner.imageUrl} 
            alt={cleaner.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
            <Star className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-semibold shadow-sm backdrop-blur-md bg-white/90">
            ${cleaner.rate}/hr
          </Badge>
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-display text-xl font-bold line-clamp-1">{cleaner.name}</h3>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
          <MapPin className="w-4 h-4" />
          <span>{cleaner.city}</span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {cleaner.bio}
        </p>
        
        <div className="flex flex-wrap gap-1.5">
          {cleaner.specialties?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {(cleaner.specialties?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{cleaner.specialties!.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        <Link href={`/cleaners/${cleaner.id}`} className="w-full">
          <Button className="w-full gap-2">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
