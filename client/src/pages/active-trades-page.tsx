import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search } from "lucide-react";
import TradeCard from "@/components/dashboard/trade-card";
import NewTradeDialog from "@/components/dashboard/new-trade-dialog";

export default function ActiveTradesPage() {
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch trades data
  const { data: trades, isLoading } = useQuery({
    queryKey: ["/api/trades"],
  });

  // Filter trades
  const filteredTrades = () => {
    if (!trades) return [];
    
    let filtered = trades.filter((trade: any) => trade.isActive);
    
    // Apply position filter
    if (filter !== "all") {
      filtered = filtered.filter((trade: any) => 
        trade.position.toLowerCase() === filter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((trade: any) => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.apiUsed?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "profitDesc":
          return (parseFloat(b.profitLoss || "0") - parseFloat(a.profitLoss || "0"));
        case "profitAsc":
          return (parseFloat(a.profitLoss || "0") - parseFloat(b.profitLoss || "0"));
        default:
          return 0;
      }
    });
  };
  
  const getTradeCount = (type: string) => {
    if (!trades) return 0;
    
    if (type === "all") {
      return trades.filter((trade: any) => trade.isActive).length;
    }
    
    return trades.filter((trade: any) => 
      trade.isActive && trade.position.toLowerCase() === type
    ).length;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">Active Trades</h1>
          <Button onClick={() => setIsNewTradeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Trade
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setFilter("all")}
              >
                All ({getTradeCount("all")})
              </TabsTrigger>
              <TabsTrigger 
                value="long" 
                onClick={() => setFilter("long")}
              >
                Long ({getTradeCount("long")})
              </TabsTrigger>
              <TabsTrigger 
                value="short" 
                onClick={() => setFilter("short")}
              >
                Short ({getTradeCount("short")})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search trades..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>

          <TabsContent value="all" className="mt-0">
            {renderTradeGrid()}
          </TabsContent>
          <TabsContent value="long" className="mt-0">
            {renderTradeGrid()}
          </TabsContent>
          <TabsContent value="short" className="mt-0">
            {renderTradeGrid()}
          </TabsContent>
        </Tabs>
        
        <NewTradeDialog
          open={isNewTradeDialogOpen}
          onOpenChange={setIsNewTradeDialogOpen}
        />
      </div>
    </MainLayout>
  );

  function renderTradeGrid() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading trades...</span>
        </div>
      );
    }

    const filtered = filteredTrades();
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No active trades found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {searchTerm || filter !== "all"
              ? "Try changing your filters or search term"
              : "Start a new trade to see it here"}
          </p>
          <Button onClick={() => setIsNewTradeDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Start New Trade
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((trade: any) => (
          <TradeCard key={trade.id} trade={trade} />
        ))}
      </div>
    );
  }
}