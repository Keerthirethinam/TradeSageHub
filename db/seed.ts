import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create demo user
    const existingUser = await db.query.users.findFirst({
      where: (users) => schema.eq(users.username, "demo"),
    });

    let userId: number;

    if (!existingUser) {
      console.log("Creating demo user...");
      const hashedPassword = await hashPassword("password");
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: hashedPassword,
      }).returning();
      
      userId = user.id;
      console.log(`Created demo user with ID: ${userId}`);
    } else {
      userId = existingUser.id;
      console.log(`Using existing demo user with ID: ${userId}`);
    }

    // Create sample trades
    const existingTrades = await db.query.trades.findMany({
      where: (trades) => schema.eq(trades.userId, userId),
    });

    if (existingTrades.length === 0) {
      console.log("Creating sample trades...");
      
      const sampleTrades = [
        {
          userId,
          symbol: "BTC/USD",
          entryPrice: "36742.50",
          currentPrice: "37842.18",
          position: "Long",
          quantity: "0.05",
          takeProfit: "38950.00",
          stopLoss: "35250.00",
          profitLoss: "1099.68",
          profitLossPercentage: "2.99",
          apiUsed: "Binance",
          isActive: true,
        },
        {
          userId,
          symbol: "ETH/USD",
          entryPrice: "2435.20",
          currentPrice: "2512.80",
          position: "Long",
          quantity: "0.75",
          takeProfit: "2650.00",
          stopLoss: "2300.00",
          profitLoss: "77.60",
          profitLossPercentage: "3.19",
          apiUsed: "Coinbase Pro",
          isActive: true,
        },
        {
          userId,
          symbol: "XRP/USD",
          entryPrice: "0.6420",
          currentPrice: "0.6280",
          position: "Long",
          quantity: "1000",
          takeProfit: "0.7100",
          stopLoss: "0.6000",
          profitLoss: "-0.0140",
          profitLossPercentage: "-2.18",
          apiUsed: "Kraken",
          isActive: true,
        },
      ];

      const [btcTrade, ethTrade, xrpTrade] = await db.insert(schema.trades)
        .values(sampleTrades)
        .returning();

      console.log(`Created ${sampleTrades.length} sample trades`);

      // Create sample trade activities
      console.log("Creating sample trade activities...");
      
      const sampleActivities = [
        {
          userId,
          tradeId: btcTrade.id,
          type: "Trade Started",
          symbol: "BTC/USD",
          price: "36742.50",
          amount: "0.05",
          status: "Completed",
        },
        {
          userId,
          tradeId: ethTrade.id,
          type: "Trade Started",
          symbol: "ETH/USD",
          price: "2435.20",
          amount: "0.75",
          status: "Completed",
        },
        {
          userId,
          tradeId: ethTrade.id,
          type: "Take Profit Modified",
          symbol: "ETH/USD",
          price: "2435.20",
          amount: "0.75",
          status: "Updated",
        },
        {
          userId,
          tradeId: xrpTrade.id,
          type: "Trade Started",
          symbol: "XRP/USD",
          price: "0.6420",
          amount: "1000",
          status: "Completed",
        },
        {
          userId,
          type: "Trade Stopped",
          symbol: "SOL/USD",
          price: "82.30",
          amount: "2.5",
          status: "Closed",
        }
      ];

      await db.insert(schema.tradeActivities)
        .values(sampleActivities);

      console.log(`Created ${sampleActivities.length} sample trade activities`);
    } else {
      console.log(`Found ${existingTrades.length} existing trades, skipping seed`);
    }

    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
