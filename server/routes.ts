import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListingSchema, insertRentRequestSchema, insertReviewSchema, insertUserSchema, type RequestStatus } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // =====================
  // USER ROUTES
  // =====================
  
  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // =====================
  // LISTINGS ROUTES
  // =====================
  
  // Get all listings with optional search/filter
  app.get("/api/listings", async (req, res) => {
    try {
      const { category, location, minPrice, maxPrice, search, userId } = req.query;
      let listings = await storage.getListings();
      
      // Filter by category
      if (category && category !== 'all') {
        listings = listings.filter(l => l.category === category);
      }
      
      // Filter by location (case-insensitive partial match)
      if (location) {
        const loc = (location as string).toLowerCase();
        listings = listings.filter(l => l.location.toLowerCase().includes(loc));
      }
      
      // Filter by search query (title and description)
      if (search) {
        const q = (search as string).toLowerCase();
        listings = listings.filter(l => 
          l.title.toLowerCase().includes(q) || 
          (l.description?.toLowerCase().includes(q))
        );
      }
      
      // Filter by price range
      if (minPrice || maxPrice) {
        const min = Number(minPrice) || 0;
        const max = Number(maxPrice) || Infinity;
        listings = listings.filter(l => {
          const price = Number(l.priceMonthly || l.priceWeekly || l.priceDaily || l.priceFullDay || l.priceHalfDay || 0);
          return price >= min && price <= max;
        });
      }
      
      // Filter by user (for profile page)
      if (userId) {
        listings = await storage.getListingsByUser(userId as string);
      }
      
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Get user's listings
  app.get("/api/users/:userId/listings", async (req, res) => {
    try {
      const listings = await storage.getListingsByUser(req.params.userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });

  // Create listing
  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // Update listing
  app.patch("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, req.body);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  // Delete listing (soft delete)
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // =====================
  // RENT REQUESTS ROUTES
  // =====================

  // Get request by ID
  app.get("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  // Get requests for renter
  app.get("/api/users/:userId/requests/renter", async (req, res) => {
    try {
      const requests = await storage.getRentRequestsByRenter(req.params.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Get requests for owner
  app.get("/api/users/:userId/requests/owner", async (req, res) => {
    try {
      const requests = await storage.getRentRequestsByOwner(req.params.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Create rent request
  app.post("/api/requests", async (req, res) => {
    try {
      const { renterId } = req.body;
      
      // Check if user has active requests or unreviewed completed requests
      const activeRequests = await storage.getActiveRequestsForUser(renterId);
      if (activeRequests.length > 0) {
        return res.status(400).json({ 
          error: "You have an active rental or unreviewed completed order. Please finish or review before creating a new request." 
        });
      }

      const unreviewed = await storage.getUnreviewedCompletedRequests(renterId);
      if (unreviewed.length > 0) {
        return res.status(400).json({ 
          error: "You have unreviewed completed orders older than 24 hours. Please submit reviews before creating a new request." 
        });
      }

      const validatedData = insertRentRequestSchema.parse(req.body);
      const request = await storage.createRentRequest(validatedData);
      
      // If recurring, create payment milestones
      if (validatedData.isRecurring) {
        const milestones = [];
        const startDate = new Date(validatedData.startDate);
        const isMonthly = validatedData.selectedDuration === 'monthly';
        const intervalDays = isMonthly ? 30 : 7;
        
        for (let i = 0; i < 12; i++) {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (intervalDays * (i + 1)));
          
          milestones.push({
            requestId: request.id,
            milestoneNumber: i + 1,
            amount: validatedData.totalPrice,
            dueDate,
            status: 'pending'
          });
        }
        
        await storage.createPaymentMilestones(milestones);
      }
      
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  // =====================
  // STATE MACHINE TRANSITIONS
  // =====================

  // Accept request (PENDING -> ACCEPTED)
  app.post("/api/requests/:id/accept", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: "Request is not in PENDING status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'ACCEPTED');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept request" });
    }
  });

  // Reject request (PENDING -> REJECTED)
  app.post("/api/requests/:id/reject", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: "Request is not in PENDING status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'REJECTED');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject request" });
    }
  });

  // Withdraw request (PENDING -> WITHDRAWN)
  app.post("/api/requests/:id/withdraw", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'PENDING') {
        return res.status(400).json({ error: "Can only withdraw PENDING requests" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'WITHDRAWN');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to withdraw request" });
    }
  });

  // Submit handover (ACCEPTED -> HANDOVER_PENDING)
  app.post("/api/requests/:id/submit-handover", async (req, res) => {
    try {
      const { actualAmountPaid, transactionId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }

      // Check for duplicate transaction ID
      const isDuplicate = await storage.checkDuplicateTransactionId(transactionId);
      if (isDuplicate) {
        return res.status(400).json({ error: "Transaction ID already used. Please provide a unique transaction ID." });
      }

      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'ACCEPTED') {
        return res.status(400).json({ error: "Request is not in ACCEPTED status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'HANDOVER_PENDING', {
        actualAmountPaid,
        transactionId,
        handoverSubmittedAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit handover" });
    }
  });

  // Approve handover (HANDOVER_PENDING -> LIVE)
  app.post("/api/requests/:id/approve-handover", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'HANDOVER_PENDING') {
        return res.status(400).json({ error: "Request is not in HANDOVER_PENDING status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'LIVE');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve handover" });
    }
  });

  // Reject handover (HANDOVER_PENDING -> ACCEPTED)
  app.post("/api/requests/:id/reject-handover", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'HANDOVER_PENDING') {
        return res.status(400).json({ error: "Request is not in HANDOVER_PENDING status" });
      }
      
      // Clear handover data and move back to ACCEPTED
      const updated = await storage.updateRentRequestStatus(req.params.id, 'ACCEPTED', {
        actualAmountPaid: null,
        transactionId: null,
        handoverSubmittedAt: null
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject handover" });
    }
  });

  // Request return (LIVE -> RETURN_PENDING)
  app.post("/api/requests/:id/request-return", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'LIVE') {
        return res.status(400).json({ error: "Request is not in LIVE status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'RETURN_PENDING', {
        returnRequestedAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to request return" });
    }
  });

  // Complete return (RETURN_PENDING -> COMPLETED)
  app.post("/api/requests/:id/complete", async (req, res) => {
    try {
      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== 'RETURN_PENDING') {
        return res.status(400).json({ error: "Request is not in RETURN_PENDING status" });
      }
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'COMPLETED', {
        completedAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete request" });
    }
  });

  // Dispute return (RETURN_PENDING -> DISPUTED)
  app.post("/api/requests/:id/dispute", async (req, res) => {
    try {
      const { reason, userId } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Dispute reason is required" });
      }

      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      // Create dispute log
      await storage.createDisputeLog({
        requestId: req.params.id,
        userId,
        action: 'disputed',
        reason,
        previousStatus: request.status
      });
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'DISPUTED');
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dispute" });
    }
  });

  // Cancel request (ACCEPTED/HANDOVER_PENDING -> CANCELLED)
  app.post("/api/requests/:id/cancel", async (req, res) => {
    try {
      const { reason, userId } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Cancellation reason is required" });
      }

      const request = await storage.getRentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      if (request.status === 'LIVE') {
        return res.status(400).json({ error: "Cannot cancel a LIVE rental. Use dispute instead." });
      }
      
      if (!['ACCEPTED', 'HANDOVER_PENDING'].includes(request.status)) {
        return res.status(400).json({ error: "Can only cancel ACCEPTED or HANDOVER_PENDING requests" });
      }
      
      // Create dispute log
      await storage.createDisputeLog({
        requestId: req.params.id,
        userId,
        action: 'cancelled',
        reason,
        previousStatus: request.status
      });
      
      // Increment cancellation count and check for flagging
      await storage.incrementCancellationCount(userId);
      
      const updated = await storage.updateRentRequestStatus(req.params.id, 'CANCELLED', {
        cancellationReason: reason,
        cancelledBy: userId,
        cancelledAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel request" });
    }
  });

  // =====================
  // REVIEWS
  // =====================

  // Create review
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Get reviews for listing
  app.get("/api/listings/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsForListing(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // =====================
  // AUTO-COMPLETION CHECK
  // =====================

  // Endpoint to check and auto-complete stale requests
  app.post("/api/admin/auto-complete-stale", async (req, res) => {
    try {
      const staleRequests = await storage.getStaleReturnPendingRequests();
      const completed = [];
      
      for (const request of staleRequests) {
        await storage.updateRentRequestStatus(request.id, 'COMPLETED', {
          completedAt: new Date(),
          isAutoCompleted: true
        });
        completed.push(request.id);
      }
      
      res.json({ message: `Auto-completed ${completed.length} stale requests`, completed });
    } catch (error) {
      res.status(500).json({ error: "Failed to auto-complete stale requests" });
    }
  });

  // =====================
  // PAYMENT MILESTONES
  // =====================

  // Get payment milestones for a request
  app.get("/api/requests/:id/milestones", async (req, res) => {
    try {
      const milestones = await storage.getPaymentMilestones(req.params.id);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  // Mark milestone as paid
  app.post("/api/milestones/:id/pay", async (req, res) => {
    try {
      const { transactionId } = req.body;
      
      const milestone = await storage.updatePaymentMilestone(req.params.id, {
        status: 'paid',
        paidAt: new Date(),
        transactionId
      });
      
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  return httpServer;
}
