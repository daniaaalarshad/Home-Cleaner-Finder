import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleaners, users } from "@/shared/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
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
