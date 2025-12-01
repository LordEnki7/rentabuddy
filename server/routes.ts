import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import "./types"; // Import session type extensions

// Auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ========== AUTH ROUTES ==========
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const input = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser(input);

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { email, password } = validationResult.data;

      // Verify credentials
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get profile based on role
      let profile = null;
      if (user.role === 'CLIENT') {
        profile = await storage.getClientProfile(user.id);
      } else if (user.role === 'BUDDY') {
        profile = await storage.getBuddyProfile(user.id);
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        profile,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ========== PROFILE ROUTES ==========

  // Update client profile
  app.patch("/api/profile/client", requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateClientProfile(req.session.userId!, updates);
      res.json({ profile });
    } catch (error: any) {
      console.error("Update client profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Update buddy profile
  app.patch("/api/profile/buddy", requireAuth, requireRole('BUDDY'), async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateBuddyProfile(req.session.userId!, updates);
      res.json({ profile });
    } catch (error: any) {
      console.error("Update buddy profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ========== BUDDY ROUTES ==========

  // Get all buddies (public)
  app.get("/api/buddies", async (req, res) => {
    try {
      const { city, maxRate } = req.query;
      const filters: any = {};
      
      if (city) filters.city = city as string;
      if (maxRate) filters.maxRate = parseFloat(maxRate as string);

      const buddies = await storage.getAllBuddies(filters);
      res.json({ buddies });
    } catch (error: any) {
      console.error("Get buddies error:", error);
      res.status(500).json({ error: "Failed to get buddies" });
    }
  });

  // Get buddy profile by userId
  app.get("/api/buddies/:userId", async (req, res) => {
    try {
      const profile = await storage.getBuddyProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Buddy not found" });
      }

      const user = await storage.getUserById(req.params.userId);
      const reviews = await storage.getReviewsForBuddy(req.params.userId);

      res.json({ profile, user, reviews });
    } catch (error: any) {
      console.error("Get buddy error:", error);
      res.status(500).json({ error: "Failed to get buddy" });
    }
  });

  // ========== BOOKING ROUTES ==========

  // Create booking
  app.post("/api/bookings", requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        clientId: req.session.userId!,
        status: 'PENDING',
      };

      const booking = await storage.createBooking(bookingData);
      res.json({ booking });
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get bookings for current user
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const role = req.session.role;
      let bookings;

      if (role === 'CLIENT') {
        bookings = await storage.getBookingsByClient(req.session.userId!);
      } else if (role === 'BUDDY') {
        bookings = await storage.getBookingsByBuddy(req.session.userId!);
      } else {
        return res.status(403).json({ error: "Invalid role" });
      }

      res.json({ bookings });
    } catch (error: any) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Update booking status (for buddies)
  app.patch("/api/bookings/:id/status", requireAuth, requireRole('BUDDY'), async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json({ booking });
    } catch (error: any) {
      console.error("Update booking status error:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // ========== REVIEW ROUTES ==========

  // Create review
  app.post("/api/reviews", requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
      const reviewData = {
        ...req.body,
        clientId: req.session.userId!,
      };

      const review = await storage.createReview(reviewData);
      res.json({ review });
    } catch (error: any) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  return httpServer;
}
