"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateBooking } from "@/app/hooks/use-bookings";
import { useAuth } from "@/app/hooks/use-auth";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
};

interface BookingDialogProps {
  cleaner: Cleaner;
  children: React.ReactNode;
}

const formSchema = z.object({
  date: z.string().min(1, "Please select a date and time"),
  address: z.string().min(5, "Please enter a valid address"),
  notes: z.string().optional(),
});

export function BookingDialog({ cleaner, children }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      notes: "",
      date: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a cleaner",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    createBooking.mutate(
      {
        ...data,
        date: new Date(data.date),
        cleanerId: cleaner.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast({
            title: "Booking Request Sent!",
            description: "The cleaner will review your request shortly.",
          });
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Booking Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book {cleaner.name}</DialogTitle>
          <DialogDescription>
            Enter your details below to request a cleaning session.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                      className="bg-muted/30"
                      data-testid="input-booking-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Apt 4B" {...field} className="bg-muted/30" data-testid="input-booking-address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests / Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Do you have pets? Specific cleaning instructions?" 
                      className="resize-none bg-muted/30" 
                      {...field}
                      data-testid="input-booking-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full text-lg h-12 font-medium" 
              disabled={createBooking.isPending}
              data-testid="button-confirm-booking"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Request...
                </>
              ) : (
                `Confirm Request ($${cleaner.rate}/hr)`
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
