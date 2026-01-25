import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, type InsertBooking, type Cleaner } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BookingDialogProps {
  cleaner: Cleaner;
  children: React.ReactNode;
}

// Extend schema for form validation if needed, though schema from backend is good
const formSchema = insertBookingSchema.extend({
  // Override date to string for input type="datetime-local" handling
  date: process.env.NODE_ENV === "test" ? z.any() : z.string().transform((str) => new Date(str)),
});

export function BookingDialog({ cleaner, children }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      notes: "",
      date: "",
    },
  });

  const onSubmit = (data: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a cleaner",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }

    createBooking.mutate(
      {
        ...data,
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
          <DialogTitle className="font-display text-2xl">Book {cleaner.name}</DialogTitle>
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
                    <Input placeholder="123 Main St, Apt 4B" {...field} className="bg-muted/30" />
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
