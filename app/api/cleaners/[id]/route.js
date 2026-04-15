import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleaners, users } from "@/shared/schema";
import { eq } from "drizzle-orm";

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
