import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Printer, Search, TrendingDown, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function TradeHistoryPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activityType, setActivityType] = useState("all");
  const { toast } = useToast();

  // Fetch trade activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/trade-activities"],
  });

  // Fetch trades for the "Closed Trades" tab
  const { data: trades, isLoading: isLoadingTrades } = useQuery({
    queryKey: ["/api/trades"],
  });

  // Filter activities
  const filteredActivities = () => {
    if (!activities) return [];
    
    let filtered = [...activities];
    
    // Apply date range filter
    if (fromDate) {
      filtered = filtered.filter((activity: any) => 
        new Date(activity.createdAt) >= fromDate
      );
    }
    
    if (toDate) {
      // Add one day to include the end date fully
      const adjustedToDate = new Date(toDate);
      adjustedToDate.setDate(adjustedToDate.getDate() + 1);
      
      filtered = filtered.filter((activity: any) => 
        new Date(activity.createdAt) <= adjustedToDate
      );
    }
    
    // Apply type filter
    if (activityType !== "all") {
      filtered = filtered.filter((activity: any) => 
        activity.type.toLowerCase().includes(activityType.toLowerCase())
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((activity: any) => 
        activity.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  // Filter closed trades
  const filteredClosedTrades = () => {
    if (!trades) return [];
    
    let filtered = trades.filter((trade: any) => !trade.isActive);
    
    // Apply date range filter
    if (fromDate) {
      filtered = filtered.filter((trade: any) => 
        new Date(trade.closedAt || trade.createdAt) >= fromDate
      );
    }
    
    if (toDate) {
      // Add one day to include the end date fully
      const adjustedToDate = new Date(toDate);
      adjustedToDate.setDate(adjustedToDate.getDate() + 1);
      
      filtered = filtered.filter((trade: any) => 
        new Date(trade.closedAt || trade.createdAt) <= adjustedToDate
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((trade: any) => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.apiUsed?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.closedAt || b.createdAt).getTime() - new Date(a.closedAt || a.createdAt).getTime();
        case "oldest":
          return new Date(a.closedAt || a.createdAt).getTime() - new Date(b.closedAt || b.createdAt).getTime();
        case "profitDesc":
          return (parseFloat(b.profitLoss || "0") - parseFloat(a.profitLoss || "0"));
        case "profitAsc":
          return (parseFloat(a.profitLoss || "0") - parseFloat(b.profitLoss || "0"));
        default:
          return 0;
      }
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Trade History",
      description: "This feature is not implemented yet",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Print Trade History",
      description: "This feature is not implemented yet",
    });
  };

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSearchTerm("");
    setSortBy("newest");
    setActivityType("all");
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return '$0.00';
    
    return numPrice >= 1 
      ? `$${numPrice.toFixed(2)}` 
      : `$${numPrice.toFixed(4)}`;
  };

  // Visualize profit/loss
  const formatProfitLoss = (profitLoss: string | number) => {
    const pl = typeof profitLoss === 'string' ? parseFloat(profitLoss) : profitLoss;
    
    if (isNaN(pl)) return { text: "$0.00", class: "text-slate-500" };
    
    if (pl > 0) {
      return {
        text: `+$${Math.abs(pl).toFixed(2)}`,
        class: "text-green-600 dark:text-green-400",
        icon: <TrendingUp className="h-4 w-4 inline mr-1" />,
      };
    } else if (pl < 0) {
      return {
        text: `-$${Math.abs(pl).toFixed(2)}`,
        class: "text-red-600 dark:text-red-400",
        icon: <TrendingDown className="h-4 w-4 inline mr-1" />,
      };
    } else {
      return { text: "$0.00", class: "text-slate-500" };
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "trade started":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Started</Badge>;
      case "trade modified":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Modified</Badge>;
      case "trade stopped":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Stopped</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">Trade History</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="activities">
          <TabsList className="mb-4">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="closed">Closed Trades</TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium block mb-2">From Date</label>
                  <DatePicker date={fromDate} setDate={setFromDate} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">To Date</label>
                  <DatePicker date={toDate} setDate={setToDate} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="profitDesc">Profit (high to low)</SelectItem>
                      <SelectItem value="profitAsc">Profit (low to high)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <TabsContent value="activities" className="mt-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Activity Type</label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="started">Trade Started</SelectItem>
                        <SelectItem value="modified">Trade Modified</SelectItem>
                        <SelectItem value="stopped">Trade Stopped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>

                {/* Activities Table */}
                {renderActivitiesTable()}
              </TabsContent>

              <TabsContent value="closed" className="mt-0">
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>

                {/* Closed Trades Table */}
                {renderClosedTradesTable()}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </MainLayout>
  );

  function renderActivitiesTable() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading activities...</span>
        </div>
      );
    }

    const filtered = filteredActivities();
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No activities found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || fromDate || toDate || activityType !== "all"
              ? "Try changing your filters or search term"
              : "Start trading to see your activity history"}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Activity Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filtered.map((activity: any) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">
                  {format(new Date(activity.createdAt), "MMM d, yyyy HH:mm")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getActivityTypeLabel(activity.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  {activity.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {formatPrice(activity.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {parseFloat(activity.amount).toString()} {activity.symbol?.split('/')[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {activity.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderClosedTradesTable() {
    if (isLoadingTrades) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading trades...</span>
        </div>
      );
    }

    const filtered = filteredClosedTrades();
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No closed trades found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || fromDate || toDate
              ? "Try changing your filters or search term"
              : "Close some trades to see them here"}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Closed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Exit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                P/L
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filtered.map((trade: any) => {
              const profitLoss = formatProfitLoss(trade.profitLoss || 0);
              
              return (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">
                    {format(new Date(trade.closedAt || trade.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {trade.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {trade.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatPrice(trade.entryPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatPrice(trade.exitPrice || trade.currentPrice || trade.entryPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {trade.quantity} {trade.symbol?.split('/')[0]}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${profitLoss.class}`}>
                    {profitLoss.icon && profitLoss.icon}
                    {profitLoss.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}