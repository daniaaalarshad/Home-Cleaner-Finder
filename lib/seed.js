import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { users, cleaners, bookings } from "@/shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env or .env.local file.");
}

if (process.env.NODE_ENV === "production") {
  throw new Error("Seed script cannot run in production.");
}

const connectionString = process.env.DATABASE_URL.replace(/[?&]schema=[^&]*/, '');
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log("Seeding database...");

  await db.transaction(async (tx) => {
    await tx.delete(bookings);
    await tx.delete(cleaners);
    await tx.delete(users);
    console.log("Cleared existing data");

    const passwordHash = await bcrypt.hash("password123", 12);

    const [sarah, mike, emily, john] = await tx
      .insert(users)
      .values([
        { email: "sarah@example.com", password: passwordHash, name: "Sarah Johnson", isCleaner: true },
        { email: "mike@example.com", password: passwordHash, name: "Mike Chen", isCleaner: true },
        { email: "emily@example.com", password: passwordHash, name: "Emily Davis", isCleaner: true },
        { email: "john@example.com", password: passwordHash, name: "John Smith", isCleaner: false },
      ])
      .returning();

    console.log("Created 4 users");

    const [cleanerSarah] = await tx
      .insert(cleaners)
      .values([
        {
          userId: sarah.id,
          bio: "Professional cleaner with attention to detail. I specialize in deep cleaning and organizing spaces.",
          hourlyRate: 35,
          experience: 5,
          specialties: ["Deep Cleaning", "Organization", "Move-out Cleaning"],
          location: "San Francisco, CA",
          rating: 4.9,
          reviewCount: 47,
          available: true,
        },
        {
          userId: mike.id,
          bio: "Eco-friendly cleaning expert. I use only natural and sustainable products for a healthier home.",
          hourlyRate: 40,
          experience: 7,
          specialties: ["Eco-Friendly", "Pet-Friendly", "Allergy-Safe"],
          location: "Oakland, CA",
          rating: 4.8,
          reviewCount: 32,
          available: true,
        },
        {
          userId: emily.id,
          bio: "Experienced residential cleaner. Quick, thorough, and reliable service every time.",
          hourlyRate: 30,
          experience: 3,
          specialties: ["Regular Cleaning", "Kitchen Deep Clean", "Bathroom Specialist"],
          location: "Berkeley, CA",
          rating: 4.7,
          reviewCount: 28,
          available: true,
        },
      ])
      .returning();

    console.log("Created 3 cleaners");

    await tx.insert(bookings).values({
      customerId: john.id,
      cleanerId: cleanerSarah.id,
      date: new Date("2026-02-01T10:00:00"),
      hours: 3,
      totalPrice: 105,
      status: "pending",
      address: "123 Main St, San Francisco, CA",
      notes: "Deep clean the kitchen please",
    });

    console.log("Created 1 booking");
  });

  console.log("Seeding complete!");
  console.log("\nTest login credentials:");
  console.log("  Customer: john@example.com / password123");
  console.log("  Cleaner:  sarah@example.com / password123");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
