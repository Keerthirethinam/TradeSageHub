import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

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
  // Generate sample data based on the selected timeframe
  const data = useMemo(() => {
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
    
    // Starting value
    let value = 10000;
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now.getTime() - i * interval);
      
      // Add some randomness to the value
      value = value * (1 + (Math.random() * 0.06 - 0.03));
      
      result.push({
        date: getFormattedDate(date, timeframe),
        value: Math.round(value * 100) / 100,
      });
    }
    
    return result;
  }, [timeframe]);
  
  const formatYAxis = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  const formatTooltip = (value: number) => {
    return [`$${value.toLocaleString()}`, "Portfolio Value"];
  };

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
