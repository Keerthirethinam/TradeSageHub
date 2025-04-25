import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import StatCard from "@/components/dashboard/stat-card";
import TradeCard from "@/components/dashboard/trade-card";
import TradeChart from "@/components/dashboard/trade-chart";
import TradeHistory from "@/components/dashboard/trade-history";
import NewTradeDialog from "@/components/dashboard/new-trade-dialog";
import { Loader2, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function HomePage() {
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "All">("1D");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Fetch user's trades
  const { data: trades, isLoading: isLoadingTrades } = useQuery({
    queryKey: ["/api/trades"],
  });

  // Fetch trade activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/trade-activities"],
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!trades) {
      return {
        balance: "$0.00",
        activeTrades: 0,
        dailyProfit: "$0.00",
        dailyProfitPercentage: "0.0%",
        apiStatus: "Disconnected"
      };
    }

    const activeTrades = trades.filter(trade => trade.isActive).length;
    
    // Calculate total profit/loss from active trades
    const totalProfitLoss = trades
      .filter(trade => trade.isActive)
      .reduce((sum, trade) => sum + parseFloat(trade.profitLoss || 0), 0);
    
    return {
      balance: "$12,450.80", // This would normally come from an API
      activeTrades,
      dailyProfit: `$${totalProfitLoss.toFixed(2)}`,
      dailyProfitPercentage: totalProfitLoss > 0 ? "↑ 3.2%" : "↓ 1.5%",
      apiStatus: "Connected"
    };
  }, [trades]);

  // Paginate trades
  const paginatedTrades = useMemo(() => {
    if (!trades) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const activeTrades = trades.filter(trade => trade.isActive);
    return activeTrades.slice(startIndex, startIndex + itemsPerPage);
  }, [trades, currentPage]);

  const pageCount = useMemo(() => {
    if (!trades) return 1;
    const activeTrades = trades.filter(trade => trade.isActive);
    return Math.ceil(activeTrades.length / itemsPerPage);
  }, [trades]);

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Trading Dashboard</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats Overview */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              label="Total Balance"
              value={stats.balance}
              change="3.2%"
              changeType="increase"
              icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
              bgColor="bg-green-100 dark:bg-green-900"
              textColor="text-green-600 dark:text-green-400" 
            />
            
            <StatCard 
              label="Active Trades"
              value={String(stats.activeTrades)}
              change="2"
              changeType="increase"
              icon={<TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              bgColor="bg-blue-100 dark:bg-blue-900"
              textColor="text-blue-600 dark:text-blue-400" 
            />
            
            <StatCard 
              label="Daily Profit"
              value={stats.dailyProfit}
              change="12.5%"
              changeType="increase"
              icon={<TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
              bgColor="bg-indigo-100 dark:bg-indigo-900"
              textColor="text-indigo-600 dark:text-indigo-400" 
            />
            
            <StatCard 
              label="API Status"
              value={stats.apiStatus}
              change="Active"
              changeType="status"
              icon={<TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
              bgColor="bg-yellow-100 dark:bg-yellow-900"
              textColor="text-yellow-600 dark:text-yellow-400" 
            />
          </div>
          
          {/* Portfolio Performance Chart */}
          <div className="mt-8">
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Portfolio Performance</h3>
                <div className="mt-2">
                  <TradeChart timeframe={chartTimeframe} />
                  <div className="flex justify-center space-x-4 mt-4">
                    {(['1D', '1W', '1M', '3M', '1Y', 'All'] as const).map((timeframe) => (
                      <button 
                        key={timeframe}
                        className={`px-3 py-1 text-sm rounded-full ${
                          chartTimeframe === timeframe 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                        onClick={() => setChartTimeframe(timeframe)}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Trades Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Active Trades</h2>
              <Button onClick={() => setIsNewTradeDialogOpen(true)}>
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Trade
              </Button>
            </div>

            {/* Trade Cards Grid */}
            {isLoadingTrades ? (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedTrades.map((trade) => (
                    <TradeCard key={trade.id} trade={trade} />
                  ))}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pageCount }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)} 
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                          className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
          
          {/* Recent Trade Activity */}
          <div className="mt-8">
            <TradeHistory activities={activities} isLoading={isLoadingActivities} />
          </div>
        </div>
      </div>

      {/* New Trade Dialog */}
      <NewTradeDialog 
        open={isNewTradeDialogOpen} 
        onOpenChange={setIsNewTradeDialogOpen} 
      />
    </MainLayout>
  );
}
