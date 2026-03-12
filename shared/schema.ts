import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'CLIENT' | 'BUDDY' | 'ADMIN'
  status: text("status").notNull().default('ACTIVE'), // 'ACTIVE' | 'SUSPENDED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clientProfiles = pgTable("client_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  city: text("city"),
  shortBio: text("short_bio"),
  profileImage: text("profile_image"),
  safetyAgreementAcceptedAt: timestamp("safety_agreement_accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buddyProfiles = pgTable("buddy_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  headline: text("headline"),
  bio: text("bio"),
  city: text("city"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  experienceYears: integer("experience_years"),
  languages: json("languages").$type<string[]>(),
  activities: json("activities").$type<string[]>(),
  ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }).default('0'),
  ratingCount: integer("rating_count").default(0),
  isCertified: boolean("is_certified").default(false),
  identityVerified: boolean("identity_verified").default(false),
  backgroundCheckPassed: boolean("background_check_passed").default(false),
  codeOfConductAcceptedAt: timestamp("code_of_conduct_accepted_at"),
  safetyProtocolAcceptedAt: timestamp("safety_protocol_accepted_at"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  buddyId: varchar("buddy_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default('PENDING'), // 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'REJECTED'
  locationType: text("location_type").notNull(), // 'PUBLIC' | 'VIRTUAL'
  locationDescription: text("location_description"),
  activity: text("activity"),
  clientNotes: text("client_notes"),
  buddyNotes: text("buddy_notes"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").default('PENDING'), // 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  buddyId: varchar("buddy_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => messageThreads.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  buddyId: varchar("buddy_id").notNull().references(() => users.id),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buddyId: varchar("buddy_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sun-Sat)
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
});

export const safetyReports = pgTable("safety_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").notNull().references(() => users.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  category: text("category").notNull(), // 'harassment' | 'safety_concern' | 'inappropriate_content' | 'other'
  description: text("description").notNull(),
  status: text("status").notNull().default('OPEN'), // 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('PENDING'), // 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== AGENT SYSTEM TABLES ==========

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  capabilities: json("capabilities").$type<string[]>().notNull(),
  status: text("status").notNull().default('ACTIVE'),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentJobs = pgTable("agent_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default('MEDIUM'),
  status: text("status").notNull().default('PENDING'),
  result: json("result").$type<Record<string, any>>(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentRuns = pgTable("agent_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id),
  jobId: varchar("job_id").references(() => agentJobs.id),
  actionLog: json("action_log").$type<string[]>().notNull(),
  outputSummary: text("output_summary"),
  qualityScore: integer("quality_score"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentMemory = pgTable("agent_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id),
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: json("value").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for registration
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CLIENT", "BUDDY"]),
  city: z.string().optional(),
  safetyAgreementAccepted: z.boolean().optional(),
  codeOfConductAccepted: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBuddyProfileSchema = createInsertSchema(buddyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export const insertSafetyReportSchema = createInsertSchema(safetyReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true });
export const insertAgentJobSchema = createInsertSchema(agentJobs).omit({ id: true, createdAt: true });
export const insertAgentRunSchema = createInsertSchema(agentRuns).omit({ id: true, createdAt: true });
export const insertAgentMemorySchema = createInsertSchema(agentMemory).omit({ id: true, createdAt: true, updatedAt: true });

// Select types
export type User = typeof users.$inferSelect;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type BuddyProfile = typeof buddyProfiles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageThread = typeof messageThreads.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type SafetyReport = typeof safetyReports.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type AgentJob = typeof agentJobs.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type AgentMemory = typeof agentMemory.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type InsertBuddyProfile = z.infer<typeof insertBuddyProfileSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertAgentJob = z.infer<typeof insertAgentJobSchema>;
export type InsertAgentRun = z.infer<typeof insertAgentRunSchema>;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;

// Auth types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
