import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  users,
  clientProfiles,
  buddyProfiles,
  bookings,
  reviews,
  messages,
  messageThreads,
  availability,
  safetyReports,
  transactions,
  type User,
  type InsertUser,
  type ClientProfile,
  type InsertClientProfile,
  type BuddyProfile,
  type InsertBuddyProfile,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type MessageThread,
  type InsertMessageThread,
  type Availability,
  type InsertAvailability,
  type SafetyReport,
  type InsertSafetyReport,
  type Transaction,
  type InsertTransaction,
  type RegisterInput,
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool);

export interface IStorage {
  // Auth
  createUser(input: RegisterInput): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | null>;

  // Client Profiles
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  getClientProfile(userId: string): Promise<ClientProfile | undefined>;
  updateClientProfile(userId: string, updates: Partial<InsertClientProfile>): Promise<ClientProfile | undefined>;

  // Buddy Profiles
  createBuddyProfile(profile: InsertBuddyProfile): Promise<BuddyProfile>;
  getBuddyProfile(userId: string): Promise<BuddyProfile | undefined>;
  updateBuddyProfile(userId: string, updates: Partial<InsertBuddyProfile>): Promise<BuddyProfile | undefined>;
  getAllBuddies(filters?: { city?: string, maxRate?: number, activities?: string[], minRating?: number }): Promise<Array<BuddyProfile & { user: User }>>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByClient(clientId: string): Promise<Booking[]>;
  getBookingsByBuddy(buddyId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForBuddy(buddyId: string): Promise<Review[]>;

  // Messages
  getOrCreateMessageThread(clientId: string, buddyId: string): Promise<MessageThread>;
  getMessageThreads(userId: string): Promise<MessageThread[]>;
  getMessages(threadId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Availability
  getAvailability(buddyId: string): Promise<Availability[]>;
  setAvailability(buddyId: string, dayOfWeek: number, startTime: string, endTime: string): Promise<Availability>;

  // Safety Reports
  createSafetyReport(report: InsertSafetyReport): Promise<SafetyReport>;
  getSafetyReports(): Promise<SafetyReport[]>;
  getSafetyReportsByUser(userId: string): Promise<SafetyReport[]>;
  updateSafetyReportStatus(id: string, status: string, resolvedAt?: Date): Promise<SafetyReport | undefined>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;

  // Admin
  getAllUsers(): Promise<User[]>;
  getAllBookings(): Promise<Booking[]>;
  updateUserStatus(id: string, status: string): Promise<User | undefined>;
  updateBuddyVerification(userId: string, field: string, value: boolean): Promise<BuddyProfile | undefined>;
  getAdminStats(): Promise<{ totalUsers: number; totalBuddies: number; totalClients: number; totalBookings: number; totalCompleted: number; totalRevenue: number; openReports: number }>;
}

export class DbStorage implements IStorage {
  // Auth methods
  async createUser(input: RegisterInput): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    
    const [user] = await db.insert(users).values({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      status: 'ACTIVE',
    }).returning();

    // Create associated profile based on role
    if (input.role === 'CLIENT') {
      await db.insert(clientProfiles).values({
        userId: user.id,
        city: input.city || null,
        safetyAgreementAcceptedAt: input.safetyAgreementAccepted ? new Date() : null,
      });
    } else if (input.role === 'BUDDY') {
      await db.insert(buddyProfiles).values({
        userId: user.id,
        city: input.city || null,
        codeOfConductAcceptedAt: input.codeOfConductAccepted ? new Date() : null,
        safetyProtocolAcceptedAt: input.codeOfConductAccepted ? new Date() : null,
      });
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // Client Profile methods
  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const [clientProfile] = await db.insert(clientProfiles).values(profile).returning();
    return clientProfile;
  }

  async getClientProfile(userId: string): Promise<ClientProfile | undefined> {
    const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId));
    return profile;
  }

  async updateClientProfile(userId: string, updates: Partial<InsertClientProfile>): Promise<ClientProfile | undefined> {
    const [profile] = await db.update(clientProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clientProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Buddy Profile methods
  async createBuddyProfile(profile: InsertBuddyProfile): Promise<BuddyProfile> {
    const [buddyProfile] = await db.insert(buddyProfiles).values(profile).returning();
    return buddyProfile;
  }

  async getBuddyProfile(userId: string): Promise<BuddyProfile | undefined> {
    const [profile] = await db.select().from(buddyProfiles).where(eq(buddyProfiles.userId, userId));
    return profile;
  }

  async updateBuddyProfile(userId: string, updates: Partial<InsertBuddyProfile>): Promise<BuddyProfile | undefined> {
    const [profile] = await db.update(buddyProfiles)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      } as any)
      .where(eq(buddyProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getAllBuddies(filters?: { city?: string, maxRate?: number, activities?: string[], minRating?: number }): Promise<Array<BuddyProfile & { user: User }>> {
    const conditions = [eq(users.status, 'ACTIVE')];

    if (filters?.city) {
      conditions.push(like(buddyProfiles.city, `%${filters.city}%`));
    }
    if (filters?.maxRate) {
      conditions.push(sql`CAST(${buddyProfiles.hourlyRate} AS numeric) <= ${filters.maxRate}`);
    }
    if (filters?.minRating) {
      conditions.push(sql`CAST(${buddyProfiles.ratingAverage} AS numeric) >= ${filters.minRating}`);
    }

    const result = await db.select()
      .from(buddyProfiles)
      .innerJoin(users, eq(users.id, buddyProfiles.userId))
      .where(and(...conditions));

    let mapped = result.map((r: any) => ({ ...r.buddy_profiles, user: r.users }));

    if (filters?.activities && filters.activities.length > 0) {
      mapped = mapped.filter((b: any) => {
        if (!b.activities) return false;
        return filters.activities!.some(a => b.activities.includes(a));
      });
    }

    return mapped;
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByClient(clientId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.clientId, clientId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByBuddy(buddyId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.buddyId, buddyId))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();

    // Update buddy's rating
    const allReviews = await this.getReviewsForBuddy(review.buddyId);
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await db.update(buddyProfiles)
      .set({ 
        ratingAverage: avgRating.toFixed(2),
        ratingCount: allReviews.length 
      })
      .where(eq(buddyProfiles.userId, review.buddyId));

    return newReview;
  }

  async getReviewsForBuddy(buddyId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.buddyId, buddyId))
      .orderBy(desc(reviews.createdAt));
  }

  // Message methods
  async getOrCreateMessageThread(clientId: string, buddyId: string): Promise<MessageThread> {
    const existing = await db.select().from(messageThreads)
      .where(and(
        eq(messageThreads.clientId, clientId),
        eq(messageThreads.buddyId, buddyId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newThread] = await db.insert(messageThreads).values({
      clientId,
      buddyId,
    }).returning();

    return newThread;
  }

  async getMessageThreads(userId: string): Promise<MessageThread[]> {
    const threads = await db.select().from(messageThreads)
      .where(or(
        eq(messageThreads.clientId, userId),
        eq(messageThreads.buddyId, userId)
      ))
      .orderBy(desc(messageThreads.lastMessageAt));
    return threads;
  }

  async getMessageThreadsWithUsers(userId: string): Promise<Array<MessageThread & { clientName: string; buddyName: string }>> {
    const threads = await this.getMessageThreads(userId);
    const enriched = await Promise.all(threads.map(async (thread) => {
      const client = await this.getUserById(thread.clientId);
      const buddy = await this.getUserById(thread.buddyId);
      return {
        ...thread,
        clientName: client?.name || "Unknown",
        buddyName: buddy?.name || "Unknown",
      };
    }));
    return enriched;
  }

  async getMessages(threadId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();

    // Update thread's last message
    await db.update(messageThreads)
      .set({
        lastMessage: newMessage.content,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messageThreads.id, newMessage.threadId));

    return newMessage;
  }

  // Availability methods
  async getAvailability(buddyId: string): Promise<Availability[]> {
    return await db.select().from(availability)
      .where(eq(availability.buddyId, buddyId));
  }

  async setAvailability(buddyId: string, dayOfWeek: number, startTime: string, endTime: string): Promise<Availability> {
    const existing = await db.select().from(availability)
      .where(and(
        eq(availability.buddyId, buddyId),
        eq(availability.dayOfWeek, dayOfWeek)
      ));

    if (existing.length > 0) {
      const [updated] = await db.update(availability)
        .set({ startTime, endTime })
        .where(eq(availability.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newAvail] = await db.insert(availability).values({
      buddyId,
      dayOfWeek,
      startTime,
      endTime,
    }).returning();

    return newAvail;
  }

  // Safety Report methods
  async createSafetyReport(report: InsertSafetyReport): Promise<SafetyReport> {
    const [newReport] = await db.insert(safetyReports).values(report).returning();
    return newReport;
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    return await db.select().from(safetyReports)
      .orderBy(desc(safetyReports.createdAt));
  }

  async getSafetyReportsByUser(userId: string): Promise<SafetyReport[]> {
    return await db.select().from(safetyReports)
      .where(eq(safetyReports.reporterId, userId))
      .orderBy(desc(safetyReports.createdAt));
  }

  async updateSafetyReportStatus(id: string, status: string, resolvedAt?: Date): Promise<SafetyReport | undefined> {
    const updates: any = { status };
    if (resolvedAt) updates.resolvedAt = resolvedAt;
    const [report] = await db.update(safetyReports)
      .set(updates)
      .where(eq(safetyReports.id, id))
      .returning();
    return report;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateUserStatus(id: string, status: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateBuddyVerification(userId: string, field: string, value: boolean): Promise<BuddyProfile | undefined> {
    const updateData: any = {};
    if (field === 'identityVerified') updateData.identityVerified = value;
    else if (field === 'backgroundCheckPassed') updateData.backgroundCheckPassed = value;
    else if (field === 'isCertified') updateData.isCertified = value;
    else return undefined;

    const [profile] = await db.update(buddyProfiles)
      .set(updateData)
      .where(eq(buddyProfiles.userId, userId))
      .returning();
    return profile;
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalBuddies: number; totalClients: number; totalBookings: number; totalCompleted: number; totalRevenue: number; openReports: number }> {
    const allUsers = await db.select().from(users);
    const allBookings = await db.select().from(bookings);
    const openReportsResult = await db.select().from(safetyReports).where(eq(safetyReports.status, 'OPEN'));
    const completedBookings = allBookings.filter(b => b.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(String(b.totalPrice || '0')), 0);

    return {
      totalUsers: allUsers.filter(u => u.role !== 'ADMIN').length,
      totalBuddies: allUsers.filter(u => u.role === 'BUDDY').length,
      totalClients: allUsers.filter(u => u.role === 'CLIENT').length,
      totalBookings: allBookings.length,
      totalCompleted: completedBookings.length,
      totalRevenue,
      openReports: openReportsResult.length,
    };
  }

  async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentabuddy.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'RaB$ecure2026!Admin';

    const existing = await this.getUserByEmail(adminEmail);
    if (existing) return;

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      email: adminEmail,
      name: 'Platform Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    console.log(`Admin user created: ${adminEmail}`);
  }
}

export const storage = new DbStorage();
