"use client";

import Link from "next/link";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import type { CleanerWithUser } from "@/shared/schema";

interface CleanerCardProps {
  cleaner: CleanerWithUser;
}

export function CleanerCard({ cleaner }: CleanerCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-cleaner-${cleaner.id}`}>
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {cleaner.imageUrl ? (
          <img 
            src={cleaner.imageUrl} 
            alt={cleaner.user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {cleaner.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg" data-testid={`text-cleaner-name-${cleaner.id}`}>
            {cleaner.user.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span data-testid={`text-cleaner-rating-${cleaner.id}`}>
              {cleaner.rating?.toFixed(1) || "5.0"}
            </span>
            <span className="text-muted-foreground">
              ({cleaner.reviewCount || 0})
            </span>
          </div>
        </div>

        {cleaner.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{cleaner.location}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>{cleaner.experience} years experience</span>
        </div>

        {cleaner.specialties && cleaner.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {cleaner.specialties.slice(0, 3).map((specialty, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs bg-secondary rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary" data-testid={`text-cleaner-rate-${cleaner.id}`}>
            PKR {cleaner.hourlyRate}/hr
          </div>
          <Link href={`/cleaners/${cleaner.id}`} data-testid={`link-view-cleaner-${cleaner.id}`}>
            <Button size="sm">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
