import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { insertCleanerSchema } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city") || undefined;
    const search = searchParams.get("search") || undefined;
    
    const cleaners = await storage.getCleaners({ city, search });
    return NextResponse.json(cleaners);
  } catch (err) {
    console.error("Get cleaners error:", err);
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
    const parsed = insertCleanerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const cleaner = await storage.createCleaner({
      ...parsed.data,
      userId: user.id,
    });
    
    return NextResponse.json(cleaner, { status: 201 });
  } catch (err) {
    console.error("Create cleaner error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
