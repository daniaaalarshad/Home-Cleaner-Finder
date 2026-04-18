import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import emailjs from "@emailjs/nodejs";

const schema = z.object({
  email: z.string().email(),
  origin: z.string().url().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, origin } = schema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    // Always respond the same way to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Invalidate old tokens
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.userId, user.id));

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = origin || "http://localhost:5000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email via EmailJS Node.js SDK (server-side, uses env secrets)
    const emailjsOptions = { publicKey: process.env.EMAILJS_PUBLIC_KEY };
    if (process.env.EMAILJS_PRIVATE_KEY) {
      emailjsOptions.privateKey = process.env.EMAILJS_PRIVATE_KEY;
    }

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: user.email,
        user_name: user.name,
        reset_link: resetLink,
      },
      emailjsOptions
    );

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
