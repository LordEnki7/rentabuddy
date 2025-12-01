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
  tags: json("tags").$type<string[]>(),
  ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }).default('0'),
  ratingCount: integer("rating_count").default(0),
  isCertified: boolean("is_certified").default(false),
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
  clientNotes: text("client_notes"),
  buddyNotes: text("buddy_notes"),
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

// Select types
export type User = typeof users.$inferSelect;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type BuddyProfile = typeof buddyProfiles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type InsertBuddyProfile = z.infer<typeof insertBuddyProfileSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Auth types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
