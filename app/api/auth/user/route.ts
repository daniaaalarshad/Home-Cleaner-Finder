import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isCleaner: user.isCleaner,
    });
  } catch (error) {
    console.error("Auth user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
