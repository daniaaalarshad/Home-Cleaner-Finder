import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // App routes
  app.get(api.cleaners.list.path, async (req, res) => {
    const city = req.query.city as string | undefined;
    const search = req.query.search as string | undefined;
    const cleaners = await storage.getCleaners({ city, search });
    res.json(cleaners);
  });

  app.get(api.cleaners.get.path, async (req, res) => {
    const cleaner = await storage.getCleaner(Number(req.params.id));
    if (!cleaner) {
      return res.status(404).json({ message: 'Cleaner not found' });
    }
    res.json(cleaner);
  });

  app.post(api.cleaners.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const user = req.user as any;
      const input = api.cleaners.create.input.parse(req.body);
      const cleaner = await storage.createCleaner({
        ...input,
        userId: user.id,
      });
      res.status(201).json(cleaner);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.put(api.cleaners.update.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = req.user as any;
    const cleanerId = Number(req.params.id);
    const existing = await storage.getCleaner(cleanerId);
    
    if (!existing) {
      return res.status(404).json({ message: 'Cleaner not found' });
    }
    
    if (existing.userId !== user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const input = api.cleaners.update.input.parse(req.body);
      const updated = await storage.updateCleaner(cleanerId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = req.user as any;
    
    // Check if user is a cleaner to determine role view? 
    // Or return both? Simple: return bookings where user is customer OR cleaner.
    // The storage method separates them. Let's return a combined list or based on a query param?
    // Let's check if they have a cleaner profile.
    const cleanerProfile = await storage.getCleanerByUserId(user.id);
    
    const customerBookings = await storage.getBookings(user.id, 'customer');
    const cleanerBookings = cleanerProfile ? await storage.getBookings(user.id, 'cleaner') : [];

    // Combine or decide structure. The route returns Bookings[].
    // Let's just return customer bookings by default unless ?role=cleaner is passed
    const role = req.query.role as 'customer' | 'cleaner' || 'customer';
    const bookings = await storage.getBookings(user.id, role);
    res.json(bookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const user = req.user as any;
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking({
        ...input,
        customerId: user.id,
        date: new Date(input.date), // Ensure date object
      });
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = req.user as any;
    const bookingId = Number(req.params.id);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only cleaner or customer can update? Usually cleaner confirms/completes, customer cancels.
    // For simplicity, let's verify ownership.
    const cleanerProfile = await storage.getCleanerByUserId(user.id);
    const isCleaner = cleanerProfile && cleanerProfile.id === booking.cleanerId;
    const isCustomer = booking.customerId === user.id;

    if (!isCleaner && !isCustomer) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { status } = req.body;
    const updated = await storage.updateBookingStatus(bookingId, status);
    res.json(updated);
  });

  return httpServer;
}
