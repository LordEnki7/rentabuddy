import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
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
  getAllBuddies(filters?: { city?: string, maxRate?: number, activities?: string[] }): Promise<Array<BuddyProfile & { user: User }>>;

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

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;
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

  async getAllBuddies(filters?: { city?: string, maxRate?: number, activities?: string[] }): Promise<Array<BuddyProfile & { user: User }>> {
    let baseQuery = db.select()
      .from(buddyProfiles)
      .innerJoin(users, eq(users.id, buddyProfiles.userId))
      .where(eq(users.status, 'ACTIVE')) as any;

    const result = await baseQuery;
    return result.map((r: any) => ({ ...r.buddy_profiles, user: r.users }));
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
    return await db.select().from(messageThreads)
      .where(or(
        eq(messageThreads.clientId, userId),
        eq(messageThreads.buddyId, userId)
      ))
      .orderBy(desc(messageThreads.lastMessageAt));
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
}

export const storage = new DbStorage();
