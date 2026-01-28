import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { insertBookingSchema } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const role = (searchParams.get("role") as 'customer' | 'cleaner') || 'customer';
    
    const bookings = await storage.getBookings(user.id, role);
    return NextResponse.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = insertBookingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const booking = await storage.createBooking({
      ...parsed.data,
      customerId: user.id,
      date: new Date(parsed.data.date),
    });
    
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
