import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { message: "Email, password, and first name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName: lastName || null,
      })
      .returning();

    await login(newUser.id);

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
