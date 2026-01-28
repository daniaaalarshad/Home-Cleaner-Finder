import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 12;

export interface SessionData {
  userId?: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "homeshine-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  
  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function login(userId: string) {
  const session = await getSession();
  session.userId = userId;
  session.isLoggedIn = true;
  await session.save();
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
