import { db } from "@db";
import { users, trades, tradeActivities, User } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; password: string }): Promise<User>;
  
  getTrades(userId: number): Promise<any[]>;
  getTradeById(tradeId: number): Promise<any | undefined>;
  createTrade(tradeData: any): Promise<any>;
  updateTrade(tradeId: number, tradeData: any): Promise<any | undefined>;
  closeTrade(tradeId: number): Promise<any | undefined>;
  
  getTradeActivities(userId: number, limit?: number): Promise<any[]>;
  createTradeActivity(activityData: any): Promise<any>;
  
  sessionStore: session.SessionStore;
}

export const storage: IStorage = {
  async getUser(id: number) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  },

  async getUserByUsername(username: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  },

  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  async getTrades(userId: number) {
    const result = await db.query.trades.findMany({
      where: eq(trades.userId, userId),
      orderBy: [desc(trades.isActive), desc(trades.createdAt)],
    });
    return result;
  },

  async getTradeById(tradeId: number) {
    const result = await db.query.trades.findFirst({
      where: eq(trades.id, tradeId),
    });
    return result;
  },

  async createTrade(tradeData) {
    const [trade] = await db.insert(trades).values(tradeData).returning();
    return trade;
  },

  async updateTrade(tradeId: number, tradeData) {
    const [updatedTrade] = await db
      .update(trades)
      .set(tradeData)
      .where(eq(trades.id, tradeId))
      .returning();
    return updatedTrade;
  },

  async closeTrade(tradeId: number) {
    const [closedTrade] = await db
      .update(trades)
      .set({ isActive: false, closedAt: new Date() })
      .where(eq(trades.id, tradeId))
      .returning();
    return closedTrade;
  },

  async getTradeActivities(userId: number, limit = 10) {
    const result = await db.query.tradeActivities.findMany({
      where: eq(tradeActivities.userId, userId),
      orderBy: [desc(tradeActivities.createdAt)],
      limit,
    });
    return result;
  },

  async createTradeActivity(activityData) {
    const [activity] = await db
      .insert(tradeActivities)
      .values(activityData)
      .returning();
    return activity;
  },

  sessionStore: new PostgresSessionStore({
    pool,
    createTableIfMissing: true,
  }),
};
