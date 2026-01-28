import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, cleaners } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { status } = updateStatusSchema.parse(body);

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const cleaner = await db.query.cleaners.findFirst({
      where: eq(cleaners.userId, session.userId),
    });

    const isCleanerOwner = cleaner && cleaner.id === booking.cleanerId;
    const isCustomer = booking.customerId === session.userId;

    if (!isCleanerOwner && !isCustomer) {
      return NextResponse.json({ error: "Not authorized to update this booking" }, { status: 403 });
    }

    if (isCustomer && status !== "cancelled") {
      return NextResponse.json({ error: "Customers can only cancel bookings" }, { status: 403 });
    }

    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
