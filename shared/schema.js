import { pgTable, serial, text, integer, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isCleaner: boolean("is_cleaner").default(false),
});

export const cleaners = pgTable("cleaners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  hourlyRate: doublePrecision("hourly_rate").notNull(),
  experience: integer("experience").notNull(),
  specialties: text("specialties").array(),
  location: text("location"),
  rating: doublePrecision("rating").default(5.0),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url"),
  available: boolean("available").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  cleanerId: integer("cleaner_id").notNull().references(() => cleaners.id),
  date: timestamp("date").notNull(),
  hours: integer("hours").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  status: text("status").notNull().default("pending"),
  address: text("address").notNull(),
  notes: text("notes"),
  customerRating: integer("customer_rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cleaner: one(cleaners, {
    fields: [users.id],
    references: [cleaners.userId],
  }),
  bookings: many(bookings),
}));

export const cleanersRelations = relations(cleaners, ({ one, many }) => ({
  user: one(users, {
    fields: [cleaners.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  cleaner: one(cleaners, {
    fields: [bookings.cleanerId],
    references: [cleaners.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCleanerSchema = createInsertSchema(cleaners).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
