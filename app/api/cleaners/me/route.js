import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleaners, users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(cleaners)
      .innerJoin(users, eq(cleaners.userId, users.id))
      .where(eq(cleaners.userId, session.userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Not a cleaner" }, { status: 404 });
    }

    const row = result[0];
    return NextResponse.json({
      ...row.cleaners,
      user: {
        id: row.users.id,
        email: row.users.email,
        name: row.users.name,
        isCleaner: row.users.isCleaner,
      },
    });
  } catch (error) {
    console.error("My cleaner profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
