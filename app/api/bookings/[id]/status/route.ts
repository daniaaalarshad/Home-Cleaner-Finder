import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = Number(id);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const cleanerProfile = await storage.getCleanerByUserId(user.id);
    const isCleaner = cleanerProfile && cleanerProfile.id === booking.cleanerId;
    const isCustomer = booking.customerId === user.id;

    if (!isCleaner && !isCustomer) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;
    
    const updated = await storage.updateBookingStatus(bookingId, status);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update booking status error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
