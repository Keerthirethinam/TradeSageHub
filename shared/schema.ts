import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  tradeActivities: many(tradeActivities),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
}).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Trades Table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  position: text("position").notNull(), // "Long" or "Short"
  quantity: decimal("quantity", { precision: 16, scale: 8 }).notNull(),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  profitLoss: decimal("profit_loss", { precision: 10, scale: 2 }),
  profitLossPercentage: decimal("profit_loss_percentage", { precision: 10, scale: 2 }),
  apiUsed: text("api_used"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const tradesRelations = relations(trades, ({ one, many }) => ({
  user: one(users, { fields: [trades.userId], references: [users.id] }),
  activities: many(tradeActivities),
}));

export const insertTradeSchema = createInsertSchema(trades, {
  symbol: (schema) => schema.min(1, "Symbol is required"),
  entryPrice: (schema) => schema.min(0, "Entry price must be positive"),
  quantity: (schema) => schema.min(0, "Quantity must be positive"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// Trade Activities Table
export const tradeActivities = pgTable("trade_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tradeId: integer("trade_id").references(() => trades.id),
  type: text("type").notNull(), // "Trade Started", "Trade Modified", "Trade Stopped", etc.
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 16, scale: 8 }),
  status: text("status"), // "Completed", "Updated", "Closed", etc.
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tradeActivitiesRelations = relations(tradeActivities, ({ one }) => ({
  user: one(users, { fields: [tradeActivities.userId], references: [users.id] }),
  trade: one(trades, { fields: [tradeActivities.tradeId], references: [trades.id] }),
}));

export const insertTradeActivitySchema = createInsertSchema(tradeActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertTradeActivity = z.infer<typeof insertTradeActivitySchema>;
export type TradeActivity = typeof tradeActivities.$inferSelect;
