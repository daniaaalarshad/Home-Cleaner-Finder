import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { insertCleanerSchema } from "@/lib/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleaner = await storage.getCleaner(Number(id));
    
    if (!cleaner) {
      return NextResponse.json(
        { message: "Cleaner not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(cleaner);
  } catch (err) {
    console.error("Get cleaner error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const cleanerId = Number(id);
    const existing = await storage.getCleaner(cleanerId);
    
    if (!existing) {
      return NextResponse.json(
        { message: "Cleaner not found" },
        { status: 404 }
      );
    }
    
    if (existing.userId !== user.id) {
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

    const updated = await storage.updateCleaner(cleanerId, parsed.data);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update cleaner error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
