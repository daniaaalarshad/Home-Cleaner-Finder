import { storage } from "./storage";
import { db } from "./db";
import { cleaners, bookings } from "@shared/schema";

async function seed() {
  // Create some dummy cleaners (linked to fake user IDs or just placeholders if I can insert directly)
  // Since `userId` is a foreign key to `users` table (managed by Auth), I can't easily seed cleaners without users existing in Auth table.
  // Replit Auth users are created on login.
  // However, I can manually insert some users into the `users` table for seeding purposes.
  // `shared/models/auth.ts` has `users` table.
  
  // Let's insert some fake users first.
  const usersData = [
    {
      id: "user_1",
      email: "cleaner1@example.com",
      firstName: "Alice",
      lastName: "Cleaner",
      profileImageUrl: "/images/cleaner_1.png"
    },
    {
      id: "user_2",
      email: "cleaner2@example.com",
      firstName: "Bob",
      lastName: "Sparkle",
      profileImageUrl: "/images/cleaner_2.png"
    }
  ];

  for (const u of usersData) {
    // using raw db insert since storage might not have upsertUser exposed exactly how I want or to be safe
    // actually authStorage.upsertUser is available but I need to import it.
    // I'll just use db insert.
    await db.insert(schema.users).values(u).onConflictDoUpdate({
      target: schema.users.id,
      set: u
    });
  }

  // Now cleaners
  const cleanersData = [
    {
      userId: "user_1",
      name: "Alice Cleaner",
      bio: "Professional cleaner with 5 years experience.",
      rate: 30,
      city: "New York",
      experienceYears: 5,
      specialties: ["Deep Cleaning", "Move-in/out"],
      imageUrl: "/images/cleaner_1.png"
    },
    {
      userId: "user_2",
      name: "Bob Sparkle",
      bio: "I make your home sparkle! Eco-friendly products only.",
      rate: 40,
      city: "San Francisco",
      experienceYears: 8,
      specialties: ["Eco-friendly", "Window Cleaning"],
      imageUrl: "/images/cleaner_2.png"
    }
  ];

  for (const c of cleanersData) {
    const existing = await storage.getCleanerByUserId(c.userId);
    if (!existing) {
      await storage.createCleaner(c);
    } else {
      await storage.updateCleaner(existing.id, c);
    }
  }

  console.log("Seeding complete!");
}

import * as schema from "@shared/schema"; // need to import schema for users table usage
seed().catch(console.error);
