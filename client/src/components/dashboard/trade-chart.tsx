import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TradeChartProps {
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "All";
}

// Format the date based on the timeframe
const getFormattedDate = (date: Date, timeframe: string) => {
  switch (timeframe) {
    case "1D":
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case "1W":
    case "1M":
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case "3M":
    case "1Y":
    case "All":
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString();
  }
};

export default function TradeChart({ timeframe }: TradeChartProps) {
  // Fetch trades data
  const { data: trades, isLoading } = useQuery({
    queryKey: ["/api/trades"],
  });
  
  // Fetch activities data for historical prices
  const { data: activities } = useQuery({
    queryKey: ["/api/trade-activities"],
  });

  // Generate chart data based on real trades
  const data = useMemo(() => {
    if (!trades || !activities || !Array.isArray(trades) || !Array.isArray(activities)) {
      return [];
    }
    
    const now = new Date();
    const result = [];
    let points;
    let interval;
    
    switch (timeframe) {
      case "1D":
        points = 24;
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case "1W":
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "1M":
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "3M":
        points = 12;
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case "1Y":
        points = 12;
        interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
        break;
      case "All":
        points = 24;
        interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
        break;
      default:
        points = 24;
        interval = 60 * 60 * 1000;
    }
    
    // Calculate time range based on timeframe
    const startTime = new Date(now.getTime() - (points * interval));
    
    // Create data points at regular intervals
    for (let i = 0; i <= points; i++) {
      const pointDate = new Date(startTime.getTime() + (i * interval));
      const formattedDate = getFormattedDate(pointDate, timeframe);
      
      // Calculate portfolio value at this date
      const portfolioValue = calculatePortfolioValueAtDate(trades, activities, pointDate);
      
      result.push({
        date: formattedDate,
        value: portfolioValue,
      });
    }
    
    return result;
  }, [timeframe, trades, activities]);
  
  // Helper function to calculate portfolio value at a specific date
  function calculatePortfolioValueAtDate(trades: any[], activities: any[], date: Date) {
    if (!trades || !activities || !Array.isArray(trades) || !Array.isArray(activities)) {
      return 0;
    }
    
    // Filter trades that existed at the given date
    const relevantTrades = trades.filter(trade => {
      const createdDate = new Date(trade.createdAt);
      // Include if trade was created before or on the given date
      // and either it's still active or it was closed after the given date
      return createdDate <= date && (
        trade.isActive || 
        (trade.closedAt && new Date(trade.closedAt) > date)
      );
    });
    
    // Calculate total value at the given date
    return relevantTrades.reduce((total, trade) => {
      const quantity = trade.quantity;
      
      // Get the price of the symbol at the given date
      // We'll look at activities to estimate the price
      let estimatedPrice = trade.entryPrice; // Default to entry price
      
      // Look for an activity close to the given date to get a better price estimate
      const relevantActivities = activities
        .filter(activity => activity.tradeId === trade.id && new Date(activity.createdAt) <= date)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (relevantActivities.length > 0 && relevantActivities[0].price) {
        estimatedPrice = relevantActivities[0].price;
      } else if (date >= new Date() && trade.currentPrice) {
        // If we're looking at current or future date, use current price if available
        estimatedPrice = trade.currentPrice;
      }
      
      const tradeValue = quantity * estimatedPrice;
      return total + tradeValue;
    }, 0);
  }
  
  const formatYAxis = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  const formatTooltip = (value: number) => {
    return [`$${value.toLocaleString()}`, "Portfolio Value"];
  };

  // Show loading state if data is still being fetched
  if (isLoading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading chart data...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6B7280" 
            fontSize={12}
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
