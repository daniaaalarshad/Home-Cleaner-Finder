import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export { users } from "./models/auth";

export const cleaners = pgTable("cleaners", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  rate: integer("rate").notNull(), // Hourly rate in dollars
  city: text("city").notNull(),
  experienceYears: integer("experience_years").notNull(),
  imageUrl: text("image_url"),
  specialties: text("specialties").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  cleanerId: integer("cleaner_id").references(() => cleaners.id).notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cleanerProfile: one(cleaners, {
    fields: [users.id],
    references: [cleaners.userId],
  }),
  bookings: many(bookings, { relationName: "customerBookings" }),
}));

export const cleanersRelations = relations(cleaners, ({ one, many }) => ({
  user: one(users, {
    fields: [cleaners.userId],
    references: [users.id],
  }),
  bookings: many(bookings, { relationName: "cleanerBookings" }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: "customerBookings",
  }),
  cleaner: one(cleaners, {
    fields: [bookings.cleanerId],
    references: [cleaners.id],
    relationName: "cleanerBookings",
  }),
}));

// Schemas
export const insertCleanerSchema = createInsertSchema(cleaners).omit({ id: true, userId: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, customerId: true, createdAt: true, status: true });

// Types
export type User = typeof users.$inferSelect;
export type Cleaner = typeof cleaners.$inferSelect;
export type InsertCleaner = z.infer<typeof insertCleanerSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
