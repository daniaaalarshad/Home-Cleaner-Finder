"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Booking = {
  id: number;
  customerId: string;
  cleanerId: number;
  date: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  address: string;
  notes: string | null;
  createdAt: Date | null;
  cleaner?: any;
  customer?: any;
};

type InsertBooking = {
  cleanerId: number;
  date: Date | string;
  address: string;
  notes?: string | null;
};

export function useBookings(role: 'customer' | 'cleaner' = 'customer') {
  return useQuery({
    queryKey: ["/api/bookings", role],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?role=${role}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch bookings");
      }
      return res.json() as Promise<Booking[]>;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please log in to book");
        throw new Error("Failed to create booking");
      }
      return res.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "pending" | "confirmed" | "completed" | "cancelled" }) => {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update booking status");
      return res.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });
}
