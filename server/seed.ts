import { storage } from "./storage";
import { db } from "./db";
import { cleaners, bookings } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  const usersData = [
    {
      id: "user_1",
      email: "cleaner1@example.com",
      password: hashedPassword,
      firstName: "Alice",
      lastName: "Cleaner",
      profileImageUrl: "/images/cleaner_1.png"
    },
    {
      id: "user_2",
      email: "cleaner2@example.com",
      password: hashedPassword,
      firstName: "Bob",
      lastName: "Sparkle",
      profileImageUrl: "/images/cleaner_2.png"
    }
  ];

  for (const u of usersData) {
    await db.insert(schema.users).values(u).onConflictDoUpdate({
      target: schema.users.id,
      set: u
    });
  }

  const cleanersData = [
    {
      userId: "user_1",
      name: "Alice Cleaner",
      bio: "Professional cleaner with 5 years experience. Specializing in deep cleaning and move-in/move-out services.",
      rate: 30,
      city: "New York",
      experienceYears: 5,
      specialties: ["Deep Cleaning", "Move-in/out"],
      imageUrl: "/images/cleaner_1.png"
    },
    {
      userId: "user_2",
      name: "Bob Sparkle",
      bio: "I make your home sparkle! Eco-friendly products only. Certified green cleaning professional.",
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

import * as schema from "@shared/schema";
seed().catch(console.error);
