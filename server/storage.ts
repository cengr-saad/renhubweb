import { 
  type User, type InsertUser, 
  type Listing, type InsertListing,
  type RentRequest, type InsertRentRequest,
  type PaymentMilestone, type InsertPaymentMilestone,
  type DisputeLog, type InsertDisputeLog,
  type Review, type InsertReview,
  type RequestStatus,
  users, listings, rentRequests, paymentMilestones, disputeLogs, reviews
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, lt, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  incrementCancellationCount(userId: string): Promise<void>;
  
  // Listings
  getListings(): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  getListingsByUser(userId: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<void>;
  
  // Rent Requests
  getRentRequest(id: string): Promise<RentRequest | undefined>;
  getRentRequestsByRenter(renterId: string): Promise<RentRequest[]>;
  getRentRequestsByOwner(ownerId: string): Promise<RentRequest[]>;
  getRentRequestsByListing(listingId: string): Promise<RentRequest[]>;
  createRentRequest(request: InsertRentRequest): Promise<RentRequest>;
  updateRentRequestStatus(id: string, status: RequestStatus, additionalData?: Partial<RentRequest>): Promise<RentRequest | undefined>;
  checkDuplicateTransactionId(transactionId: string): Promise<boolean>;
  getActiveRequestsForUser(userId: string): Promise<RentRequest[]>;
  getUnreviewedCompletedRequests(userId: string): Promise<RentRequest[]>;
  getStaleReturnPendingRequests(): Promise<RentRequest[]>;
  
  // Payment Milestones
  createPaymentMilestones(milestones: InsertPaymentMilestone[]): Promise<PaymentMilestone[]>;
  getPaymentMilestones(requestId: string): Promise<PaymentMilestone[]>;
  updatePaymentMilestone(id: string, data: Partial<PaymentMilestone>): Promise<PaymentMilestone | undefined>;
  
  // Dispute Logs
  createDisputeLog(log: InsertDisputeLog): Promise<DisputeLog>;
  getDisputeLogsForUser(userId: string): Promise<DisputeLog[]>;
  getMonthlyDisputeCount(userId: string): Promise<number>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForRequest(requestId: string): Promise<Review[]>;
  getReviewsForListing(listingId: string): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async incrementCancellationCount(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    const now = new Date();
    const lastReset = user.lastCancellationReset;
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    if (lastReset && lastReset < oneMonthAgo) {
      await db.update(users).set({ 
        cancellationCount: 1, 
        lastCancellationReset: now 
      }).where(eq(users.id, userId));
    } else {
      const newCount = (user.cancellationCount || 0) + 1;
      await db.update(users).set({ 
        cancellationCount: newCount,
        isFlagged: newCount >= 3
      }).where(eq(users.id, userId));
    }
  }

  // Listings
  async getListings(): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.isActive, true)).orderBy(desc(listings.createdAt));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getListingsByUser(userId: string): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [created] = await db.insert(listings).values(listing).returning();
    return created;
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined> {
    const [updated] = await db.update(listings).set({ ...data, updatedAt: new Date() }).where(eq(listings.id, id)).returning();
    return updated;
  }

  async deleteListing(id: string): Promise<void> {
    await db.update(listings).set({ isActive: false }).where(eq(listings.id, id));
  }

  // Rent Requests
  async getRentRequest(id: string): Promise<RentRequest | undefined> {
    const [request] = await db.select().from(rentRequests).where(eq(rentRequests.id, id));
    return request;
  }

  async getRentRequestsByRenter(renterId: string): Promise<RentRequest[]> {
    return db.select().from(rentRequests).where(eq(rentRequests.renterId, renterId)).orderBy(desc(rentRequests.createdAt));
  }

  async getRentRequestsByOwner(ownerId: string): Promise<RentRequest[]> {
    return db.select().from(rentRequests).where(eq(rentRequests.ownerId, ownerId)).orderBy(desc(rentRequests.createdAt));
  }

  async getRentRequestsByListing(listingId: string): Promise<RentRequest[]> {
    return db.select().from(rentRequests).where(eq(rentRequests.listingId, listingId)).orderBy(desc(rentRequests.createdAt));
  }

  async createRentRequest(request: InsertRentRequest): Promise<RentRequest> {
    const [created] = await db.insert(rentRequests).values(request).returning();
    return created;
  }

  async updateRentRequestStatus(id: string, status: RequestStatus, additionalData?: Partial<RentRequest>): Promise<RentRequest | undefined> {
    const updateData: Partial<RentRequest> = { 
      status, 
      updatedAt: new Date(),
      ...additionalData 
    };
    const [updated] = await db.update(rentRequests).set(updateData).where(eq(rentRequests.id, id)).returning();
    return updated;
  }

  async checkDuplicateTransactionId(transactionId: string): Promise<boolean> {
    const [existing] = await db.select().from(rentRequests).where(eq(rentRequests.transactionId, transactionId));
    return !!existing;
  }

  async getActiveRequestsForUser(userId: string): Promise<RentRequest[]> {
    return db.select().from(rentRequests).where(
      and(
        eq(rentRequests.renterId, userId),
        or(
          eq(rentRequests.status, 'LIVE'),
          and(
            eq(rentRequests.status, 'COMPLETED'),
            eq(rentRequests.hasRenterReview, false)
          )
        )
      )
    );
  }

  async getUnreviewedCompletedRequests(userId: string): Promise<RentRequest[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return db.select().from(rentRequests).where(
      and(
        eq(rentRequests.renterId, userId),
        eq(rentRequests.status, 'COMPLETED'),
        eq(rentRequests.hasRenterReview, false),
        lt(rentRequests.completedAt, oneDayAgo)
      )
    );
  }

  async getStaleReturnPendingRequests(): Promise<RentRequest[]> {
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return db.select().from(rentRequests).where(
      and(
        eq(rentRequests.status, 'RETURN_PENDING'),
        lt(rentRequests.returnRequestedAt, threeDaysAgo)
      )
    );
  }

  // Payment Milestones
  async createPaymentMilestones(milestones: InsertPaymentMilestone[]): Promise<PaymentMilestone[]> {
    return db.insert(paymentMilestones).values(milestones).returning();
  }

  async getPaymentMilestones(requestId: string): Promise<PaymentMilestone[]> {
    return db.select().from(paymentMilestones).where(eq(paymentMilestones.requestId, requestId));
  }

  async updatePaymentMilestone(id: string, data: Partial<PaymentMilestone>): Promise<PaymentMilestone | undefined> {
    const [updated] = await db.update(paymentMilestones).set(data).where(eq(paymentMilestones.id, id)).returning();
    return updated;
  }

  // Dispute Logs
  async createDisputeLog(log: InsertDisputeLog): Promise<DisputeLog> {
    const [created] = await db.insert(disputeLogs).values(log).returning();
    return created;
  }

  async getDisputeLogsForUser(userId: string): Promise<DisputeLog[]> {
    return db.select().from(disputeLogs).where(eq(disputeLogs.userId, userId)).orderBy(desc(disputeLogs.createdAt));
  }

  async getMonthlyDisputeCount(userId: string): Promise<number> {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await db.select().from(disputeLogs).where(
      and(
        eq(disputeLogs.userId, userId),
        sql`${disputeLogs.createdAt} > ${oneMonthAgo}`
      )
    );
    return logs.length;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    
    // Update request review status
    if (review.reviewType === 'renter_to_owner') {
      await db.update(rentRequests).set({ hasRenterReview: true }).where(eq(rentRequests.id, review.requestId));
    } else {
      await db.update(rentRequests).set({ hasOwnerReview: true }).where(eq(rentRequests.id, review.requestId));
    }
    
    // Check if both reviews are present to archive
    const request = await this.getRentRequest(review.requestId);
    if (request?.hasRenterReview && request?.hasOwnerReview) {
      await db.update(rentRequests).set({ isArchived: true }).where(eq(rentRequests.id, review.requestId));
    }
    
    return created;
  }

  async getReviewsForRequest(requestId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.requestId, requestId));
  }

  async getReviewsForListing(listingId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.listingId, listingId)).orderBy(desc(reviews.createdAt));
  }
}

export const storage = new DatabaseStorage();
