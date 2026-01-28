"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Cleaner = {
  id: number;
  userId: string;
  name: string;
  bio: string;
  rate: number;
  city: string;
  experienceYears: number;
  imageUrl: string | null;
  specialties: string[] | null;
  createdAt: Date | null;
};

type InsertCleaner = {
  name: string;
  bio: string;
  rate: number;
  city: string;
  experienceYears: number;
  imageUrl?: string | null;
  specialties?: string[] | null;
};

export function useCleaners(filters?: { city?: string; search?: string }) {
  return useQuery({
    queryKey: ["/api/cleaners", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.city) params.set("city", filters.city);
      if (filters?.search) params.set("search", filters.search);
      
      const url = params.toString() ? `/api/cleaners?${params}` : "/api/cleaners";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cleaners");
      return res.json() as Promise<Cleaner[]>;
    },
  });
}

export function useCleaner(id: number) {
  return useQuery({
    queryKey: ["/api/cleaners", id],
    queryFn: async () => {
      const res = await fetch(`/api/cleaners/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cleaner");
      return res.json() as Promise<Cleaner>;
    },
    enabled: !!id,
  });
}

export function useCreateCleaner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCleaner) => {
      const res = await fetch("/api/cleaners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create cleaner profile");
      return res.json() as Promise<Cleaner>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleaners"] });
    },
  });
}

export function useUpdateCleaner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertCleaner>) => {
      const res = await fetch(`/api/cleaners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cleaner profile");
      return res.json() as Promise<Cleaner>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleaners", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/cleaners"] });
    },
  });
}
