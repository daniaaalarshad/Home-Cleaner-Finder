import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleaners, users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cleanerId = parseInt(id);

    if (isNaN(cleanerId)) {
      return NextResponse.json({ error: "Invalid cleaner ID" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(cleaners)
      .innerJoin(users, eq(cleaners.userId, users.id))
      .where(eq(cleaners.id, cleanerId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
    }

    const cleaner = {
      ...result[0].cleaners,
      user: {
        id: result[0].users.id,
        email: result[0].users.email,
        name: result[0].users.name,
        isCleaner: result[0].users.isCleaner,
      },
    };

    return NextResponse.json(cleaner);
  } catch (error) {
    console.error("Cleaner fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateCleanerSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  hourlyRate: z.number().min(1, "Hourly rate must be at least 1").optional(),
  experience: z.number().min(0, "Experience cannot be negative").optional(),
  specialties: z.array(z.string()).min(1, "Select at least one specialty").optional(),
  location: z.string().min(1, "Location is required").optional(),
  available: z.boolean().optional(),
});

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cleanerId = parseInt(id);

    if (isNaN(cleanerId)) {
      return NextResponse.json({ error: "Invalid cleaner ID" }, { status: 400 });
    }

    const existing = await db.query.cleaners.findFirst({
      where: eq(cleaners.id, cleanerId),
    });

    if (!existing) {
      return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateCleanerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const [updated] = await db
      .update(cleaners)
      .set(parsed.data)
      .where(eq(cleaners.id, cleanerId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cleaner update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
