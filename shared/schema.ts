import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for request status
export const requestStatusEnum = pgEnum('request_status', [
  'PENDING',
  'ACCEPTED',
  'HANDOVER_PENDING',
  'LIVE',
  'RETURN_PENDING',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'WITHDRAWN',
  'DISPUTED'
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  fullName: text("full_name"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  isFlagged: boolean("is_flagged").default(false),
  cancellationCount: integer("cancellation_count").default(0),
  lastCancellationReset: timestamp("last_cancellation_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),

  // User Location
  homeCity: text("home_city"),
  homeLatitude: decimal("home_latitude", { precision: 10, scale: 6 }),
  homeLongitude: decimal("home_longitude", { precision: 10, scale: 6 }),
});

// Listings table with flexible durations
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  location: text("location").notNull(),
  images: text("images").array(),

  // Flexible duration pricing
  priceHalfDay: decimal("price_half_day", { precision: 10, scale: 2 }),
  priceFullDay: decimal("price_full_day", { precision: 10, scale: 2 }),
  priceOvernight: decimal("price_overnight", { precision: 10, scale: 2 }),
  priceHourly: decimal("price_hourly", { precision: 10, scale: 2 }),
  priceDaily: decimal("price_daily", { precision: 10, scale: 2 }),
  priceWeekly: decimal("price_weekly", { precision: 10, scale: 2 }),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }),

  // Allowed durations
  allowedDurations: text("allowed_durations").array(),

  // Recurring settings
  isRecurring: boolean("is_recurring").default(false),
  recurringInterval: text("recurring_interval"), // 'weekly' | 'monthly'

  // Deposit
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),

  // Payment methods (array)
  paymentMethods: text("payment_methods").array(),

  // Requirements, Features, Rules
  requirements: text("requirements"),
  features: text("features").array(),
  rules: text("rules").array(),

  // Status
  isActive: boolean("is_active").default(true),
  isPaused: boolean("is_paused").default(false),

  // Metadata
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),

  // Location (GPS)
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),

  // Monetization / Featured
  listingType: text("listing_type").default('regular'), // 'regular' | 'featured'
  featuredUntil: timestamp("featured_until"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rent requests table with state machine
export const rentRequests = pgTable("rent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  renterId: varchar("renter_id").notNull().references(() => users.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),

  // Status state machine
  status: requestStatusEnum("status").notNull().default('PENDING'),

  // Rental details
  selectedDuration: text("selected_duration").notNull(), // 'half_day' | 'full_day' | 'weekly' | 'monthly' etc
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),

  // Renter info
  renterFirstName: text("renter_first_name").notNull(),
  renterLastName: text("renter_last_name").notNull(),
  renterAge: integer("renter_age").notNull(),
  renterPhone: text("renter_phone").notNull(),

  // Payment
  paymentMethod: text("payment_method").notNull(),
  isRecurring: boolean("is_recurring").default(false),

  // Handover data
  actualAmountPaid: decimal("actual_amount_paid", { precision: 10, scale: 2 }),
  transactionId: text("transaction_id").unique(),
  handoverSubmittedAt: timestamp("handover_submitted_at"),

  // Cancellation
  cancellationReason: text("cancellation_reason"),
  cancelledBy: varchar("cancelled_by").references(() => users.id),
  cancelledAt: timestamp("cancelled_at"),

  // Completion
  returnRequestedAt: timestamp("return_requested_at"),
  completedAt: timestamp("completed_at"),
  isAutoCompleted: boolean("is_auto_completed").default(false),

  // Reviews status
  hasRenterReview: boolean("has_renter_review").default(false),
  hasOwnerReview: boolean("has_owner_review").default(false),
  isArchived: boolean("is_archived").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment milestones for recurring rentals
export const paymentMilestones = pgTable("payment_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => rentRequests.id),
  milestoneNumber: integer("milestone_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default('pending'), // 'pending' | 'paid' | 'overdue'
  createdAt: timestamp("created_at").defaultNow(),
});

// Dispute logs for cancellations
export const disputeLogs = pgTable("dispute_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => rentRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'cancelled' | 'rejected' | 'disputed'
  reason: text("reason").notNull(),
  previousStatus: text("previous_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => rentRequests.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").references(() => listings.id),
  reviewType: text("review_type").notNull(), // 'renter_to_owner' | 'owner_to_renter'
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  fullName: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertRentRequestSchema = createInsertSchema(rentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  hasRenterReview: true,
  hasOwnerReview: true,
  isArchived: true,
  isAutoCompleted: true,
});

export const insertPaymentMilestoneSchema = createInsertSchema(paymentMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertDisputeLogSchema = createInsertSchema(disputeLogs).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

export type InsertRentRequest = z.infer<typeof insertRentRequestSchema>;
export type RentRequest = typeof rentRequests.$inferSelect;

export type InsertPaymentMilestone = z.infer<typeof insertPaymentMilestoneSchema>;
export type PaymentMilestone = typeof paymentMilestones.$inferSelect;

export type InsertDisputeLog = z.infer<typeof insertDisputeLogSchema>;
export type DisputeLog = typeof disputeLogs.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Request status type
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'HANDOVER_PENDING' | 'LIVE' | 'RETURN_PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'WITHDRAWN' | 'DISPUTED';
