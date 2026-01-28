"use client";

import { useQuery } from "@tanstack/react-query";
import type { CleanerWithUser } from "@/shared/schema";

export function useCleaners(search?: string) {
  const searchParam = search ? `?search=${encodeURIComponent(search)}` : "";
  
  return useQuery<CleanerWithUser[]>({
    queryKey: ["cleaners", search || ""],
    queryFn: async () => {
      const res = await fetch(`/api/cleaners${searchParam}`);
      if (!res.ok) throw new Error("Failed to fetch cleaners");
      return res.json();
    },
  });
}

export function useCleaner(id: number) {
  return useQuery<CleanerWithUser>({
    queryKey: ["cleaners", id],
    queryFn: async () => {
      const res = await fetch(`/api/cleaners/${id}`);
      if (!res.ok) throw new Error("Failed to fetch cleaner");
      return res.json();
    },
    enabled: !!id,
  });
}
