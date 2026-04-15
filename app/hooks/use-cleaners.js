"use client";

import { useQuery } from "@tanstack/react-query";

export function useCleaners(search) {
  const searchParam = search ? `?search=${encodeURIComponent(search)}` : "";
  
  return useQuery({
    queryKey: ["cleaners", search || ""],
    queryFn: async () => {
      const res = await fetch(`/api/cleaners${searchParam}`);
      if (!res.ok) throw new Error("Failed to fetch cleaners");
      return res.json();
    },
  });
}

export function useCleaner(id) {
  return useQuery({
    queryKey: ["cleaners", id],
    queryFn: async () => {
      const res = await fetch(`/api/cleaners/${id}`);
      if (!res.ok) throw new Error("Failed to fetch cleaner");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useMyCleanerProfile() {
  return useQuery({
    queryKey: ["my-cleaner-profile"],
    queryFn: async () => {
      const res = await fetch("/api/cleaners/me");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}
