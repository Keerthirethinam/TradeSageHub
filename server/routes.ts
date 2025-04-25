import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  const apiPrefix = '/api';

  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Trade routes
  app.get(`${apiPrefix}/trades`, isAuthenticated, async (req, res) => {
    try {
      const trades = await storage.getTrades(req.user!.id);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post(`${apiPrefix}/trades`, isAuthenticated, async (req, res) => {
    try {
      const tradeData = {
        ...req.body,
        userId: req.user!.id,
        isActive: true,
        createdAt: new Date(),
      };
      
      const trade = await storage.createTrade(tradeData);
      
      // Create trade activity record
      await storage.createTradeActivity({
        userId: req.user!.id,
        tradeId: trade.id,
        type: "Trade Started",
        symbol: trade.symbol,
        price: trade.entryPrice,
        amount: trade.quantity,
        status: "Completed",
        createdAt: new Date(),
      });
      
      res.status(201).json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(500).json({ message: "Failed to create trade" });
    }
  });

  app.patch(`${apiPrefix}/trades/:id`, isAuthenticated, async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const trade = await storage.getTradeById(tradeId);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      if (trade.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this trade" });
      }
      
      const updatedTrade = await storage.updateTrade(tradeId, req.body);
      
      // Create trade activity record for the update
      await storage.createTradeActivity({
        userId: req.user!.id,
        tradeId: tradeId,
        type: "Trade Modified",
        symbol: trade.symbol,
        price: trade.currentPrice || trade.entryPrice,
        amount: trade.quantity,
        status: "Updated",
        createdAt: new Date(),
      });
      
      res.json(updatedTrade);
    } catch (error) {
      console.error("Error updating trade:", error);
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  app.post(`${apiPrefix}/trades/:id/stop`, isAuthenticated, async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const trade = await storage.getTradeById(tradeId);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      if (trade.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to stop this trade" });
      }
      
      const stoppedTrade = await storage.closeTrade(tradeId);
      
      // Create trade activity record for stopping the trade
      await storage.createTradeActivity({
        userId: req.user!.id,
        tradeId: tradeId,
        type: "Trade Stopped",
        symbol: trade.symbol,
        price: trade.currentPrice || trade.entryPrice,
        amount: trade.quantity,
        status: "Closed",
        createdAt: new Date(),
      });
      
      res.json(stoppedTrade);
    } catch (error) {
      console.error("Error stopping trade:", error);
      res.status(500).json({ message: "Failed to stop trade" });
    }
  });

  // Trade activities
  app.get(`${apiPrefix}/trade-activities`, isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getTradeActivities(req.user!.id, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching trade activities:", error);
      res.status(500).json({ message: "Failed to fetch trade activities" });
    }
  });

  // User profile routes
  app.patch(`${apiPrefix}/user/profile`, isAuthenticated, async (req, res) => {
    try {
      const { username, currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      
      // Verify the current password
      const isPasswordValid = await storage.validateUserPassword(userId, currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Update user with new details
      const userData: any = { username };
      
      // If a new password is provided, hash and update it
      if (newPassword) {
        userData.password = await storage.hashPassword(newPassword);
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Return the updated user (without the password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
