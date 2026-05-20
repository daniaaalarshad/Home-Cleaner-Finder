import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  isCleaner: z.boolean().optional().default(false),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, isCleaner } = registerSchema.parse(body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      isCleaner: isCleaner ?? false,
    }).returning();

    const session = await getSession();
    session.userId = newUser.id;
    session.email = newUser.email;
    session.name = newUser.name;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isCleaner: newUser.isCleaner,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
