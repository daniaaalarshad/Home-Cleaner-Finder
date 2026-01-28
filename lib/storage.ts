import { db } from "./db";
import { eq, like, or, and, desc } from "drizzle-orm";
import { 
  cleaners, bookings, users,
  type Cleaner, type InsertCleaner, 
  type Booking, type InsertBooking, 
  type User 
} from "./schema";

export interface IStorage {
  getCleaners(filters?: { city?: string; search?: string }): Promise<Cleaner[]>;
  getCleaner(id: number): Promise<Cleaner | undefined>;
  getCleanerByUserId(userId: string): Promise<Cleaner | undefined>;
  createCleaner(cleaner: InsertCleaner & { userId: string }): Promise<Cleaner>;
  updateCleaner(id: number, updates: Partial<InsertCleaner>): Promise<Cleaner>;
  getBookings(userId: string, role: 'customer' | 'cleaner'): Promise<(Booking & { cleaner?: Cleaner; customer?: User })[]>;
  createBooking(booking: InsertBooking & { customerId: string }): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCleaners(filters?: { city?: string; search?: string }): Promise<Cleaner[]> {
    let query = db.select().from(cleaners);
    
    const conditions = [];
    if (filters?.city) {
      conditions.push(eq(cleaners.city, filters.city));
    }
    if (filters?.search) {
      conditions.push(or(
        like(cleaners.name, `%${filters.search}%`),
        like(cleaners.bio, `%${filters.search}%`)
      ));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getCleaner(id: number): Promise<Cleaner | undefined> {
    const [cleaner] = await db.select().from(cleaners).where(eq(cleaners.id, id));
    return cleaner;
  }

  async getCleanerByUserId(userId: string): Promise<Cleaner | undefined> {
    const [cleaner] = await db.select().from(cleaners).where(eq(cleaners.userId, userId));
    return cleaner;
  }

  async createCleaner(cleanerData: InsertCleaner & { userId: string }): Promise<Cleaner> {
    const [cleaner] = await db.insert(cleaners).values(cleanerData).returning();
    return cleaner;
  }

  async updateCleaner(id: number, updates: Partial<InsertCleaner>): Promise<Cleaner> {
    const [updated] = await db.update(cleaners)
      .set(updates)
      .where(eq(cleaners.id, id))
      .returning();
    return updated;
  }

  async getBookings(userId: string, role: 'customer' | 'cleaner'): Promise<any[]> {
    if (role === 'customer') {
      const results = await db.select()
        .from(bookings)
        .leftJoin(cleaners, eq(bookings.cleanerId, cleaners.id))
        .where(eq(bookings.customerId, userId))
        .orderBy(desc(bookings.date));
      
      return results.map(r => ({
        ...r.bookings,
        cleaner: r.cleaners
      }));
    } else {
      const cleaner = await this.getCleanerByUserId(userId);
      if (!cleaner) return [];

      const results = await db.select()
        .from(bookings)
        .leftJoin(users, eq(bookings.customerId, users.id))
        .where(eq(bookings.cleanerId, cleaner.id))
        .orderBy(desc(bookings.date));

      return results.map(r => ({
        ...r.bookings,
        customer: r.users
      }));
    }
  }

  async createBooking(bookingData: InsertBooking & { customerId: string }): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
}

export const storage = new DatabaseStorage();
