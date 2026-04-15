import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, cleaners } from "@/shared/schema";
import { eq, isNotNull, avg, count } from "drizzle-orm";
import { z } from "zod";

const rateSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await request.json();
    const { rating } = rateSchema.parse(body);

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== session.userId) {
      return NextResponse.json({ error: "Only the customer can rate this booking" }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only rate completed bookings" }, { status: 400 });
    }

    if (booking.customerRating !== null) {
      return NextResponse.json({ error: "You have already rated this booking" }, { status: 400 });
    }

    // Save rating on booking
    const [updated] = await db
      .update(bookings)
      .set({ customerRating: rating })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Recalculate cleaner's average rating from all rated bookings
    const stats = await db
      .select({
        avgRating: avg(bookings.customerRating),
        total: count(bookings.customerRating),
      })
      .from(bookings)
      .where(eq(bookings.cleanerId, booking.cleanerId));

    const newAvg = parseFloat(stats[0].avgRating) || 5.0;
    const newCount = parseInt(stats[0].total) || 0;

    await db
      .update(cleaners)
      .set({
        rating: Math.round(newAvg * 10) / 10,
        reviewCount: newCount,
      })
      .where(eq(cleaners.id, booking.cleanerId));

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
