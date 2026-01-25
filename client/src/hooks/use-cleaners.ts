import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCleaner } from "@shared/schema";

export function useCleaners(filters?: { city?: string; search?: string }) {
  return useQuery({
    queryKey: [api.cleaners.list.path, filters],
    queryFn: async () => {
      const url = filters 
        ? buildUrl(api.cleaners.list.path) + `?${new URLSearchParams(filters as any).toString()}`
        : api.cleaners.list.path;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cleaners");
      return api.cleaners.list.responses[200].parse(await res.json());
    },
  });
}

export function useCleaner(id: number) {
  return useQuery({
    queryKey: [api.cleaners.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cleaners.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cleaner");
      return api.cleaners.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCleaner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCleaner) => {
      const res = await fetch(api.cleaners.create.path, {
        method: api.cleaners.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create cleaner profile");
      return api.cleaners.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cleaners.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }); // Refresh user to see if they are now a cleaner
    },
  });
}

export function useUpdateCleaner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertCleaner>) => {
      const url = buildUrl(api.cleaners.update.path, { id });
      const res = await fetch(url, {
        method: api.cleaners.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cleaner profile");
      return api.cleaners.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cleaners.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.cleaners.list.path] });
    },
  });
}
