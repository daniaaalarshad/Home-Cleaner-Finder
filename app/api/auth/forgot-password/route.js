import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists for that email, a reset link has been generated.",
        resetLink: null,
      });
    }

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.userId, user.id));

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetLink = `/reset-password?token=${token}`;

    return NextResponse.json({
      message: "Reset link generated successfully.",
      resetLink,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
