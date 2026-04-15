import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleaners, users } from "@/shared/schema";
import { eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

const createCleanerSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least PKR 1"),
  experience: z.number().min(0, "Experience cannot be negative"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  location: z.string().min(1, "Location is required"),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let results;
    
    if (search) {
      results = await db
        .select()
        .from(cleaners)
        .innerJoin(users, eq(cleaners.userId, users.id))
        .where(
          or(
            ilike(users.name, `%${search}%`),
            ilike(cleaners.location || "", `%${search}%`)
          )
        );
    } else {
      results = await db
        .select()
        .from(cleaners)
        .innerJoin(users, eq(cleaners.userId, users.id));
    }

    const formattedResults = results.map((row) => ({
      ...row.cleaners,
      user: {
        id: row.users.id,
        email: row.users.email,
        name: row.users.name,
        isCleaner: row.users.isCleaner,
      },
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Cleaners fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCleaner = await db.query.cleaners.findFirst({
      where: eq(cleaners.userId, session.userId),
    });

    if (existingCleaner) {
      return NextResponse.json({ error: "You already have a cleaner profile" }, { status: 400 });
    }

    const body = await request.json();
    const data = createCleanerSchema.parse(body);

    const [newCleaner] = await db.insert(cleaners).values({
      userId: session.userId,
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      specialties: data.specialties,
      location: data.location,
      rating: 5.0,
      reviewCount: 0,
      available: true,
    }).returning();

    await db.update(users)
      .set({ isCleaner: true })
      .where(eq(users.id, session.userId));

    return NextResponse.json(newCleaner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Cleaner create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
