import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, cleaners } from "@/shared/schema";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

const createBookingSchema = z.object({
  cleanerId: z.number(),
  date: z.string(),
  hours: z.number().min(1).max(12),
  address: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get bookings where user is customer or cleaner
    const cleaner = await db.query.cleaners.findFirst({
      where: eq(cleaners.userId, session.userId),
    });

    let userBookings;
    if (cleaner) {
      userBookings = await db.query.bookings.findMany({
        where: or(
          eq(bookings.customerId, session.userId),
          eq(bookings.cleanerId, cleaner.id)
        ),
        orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
      });
    } else {
      userBookings = await db.query.bookings.findMany({
        where: eq(bookings.customerId, session.userId),
        orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
      });
    }

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createBookingSchema.parse(body);

    const cleaner = await db.query.cleaners.findFirst({
      where: eq(cleaners.id, data.cleanerId),
    });

    if (!cleaner) {
      return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
    }

    const totalPrice = cleaner.hourlyRate * data.hours;

    const [newBooking] = await db.insert(bookings).values({
      customerId: session.userId,
      cleanerId: data.cleanerId,
      date: new Date(data.date),
      hours: data.hours,
      totalPrice,
      address: data.address,
      notes: data.notes,
      status: "pending",
    }).returning();

    return NextResponse.json(newBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Booking create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
