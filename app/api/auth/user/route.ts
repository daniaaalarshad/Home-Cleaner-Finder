import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
