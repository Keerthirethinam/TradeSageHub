import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NewTradeDialog from "./new-trade-dialog";

interface TradeCardProps {
  trade: any;
}

export default function TradeCard({ trade }: TradeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const { toast } = useToast();

  // Determine border color based on profit/loss
  const getBorderClass = () => {
    if (!trade.profitLoss) return "border-l-4 border-slate-400";
    const pl = parseFloat(trade.profitLoss);
    return pl >= 0 ? "trade-success" : "trade-danger";
  };

  // Format profit/loss text and color
  const formatProfitLoss = () => {
    if (!trade.profitLoss) return { text: "$0.00", class: "text-slate-500" };
    
    const pl = parseFloat(trade.profitLoss);
    const plPercentage = trade.profitLossPercentage ? `(${trade.profitLossPercentage}%)` : "";
    
    if (pl > 0) {
      return {
        text: `+$${Math.abs(pl).toFixed(2)} ${plPercentage}`,
        class: "text-green-600 dark:text-green-400",
      };
    } else if (pl < 0) {
      return {
        text: `-$${Math.abs(pl).toFixed(2)} ${plPercentage}`,
        class: "text-red-600 dark:text-red-400",
      };
    } else {
      return { text: "$0.00", class: "text-slate-500" };
    }
  };

  // Calculate progress percentage for progress bar
  const calculateProgress = () => {
    if (!trade.currentPrice || !trade.entryPrice || !trade.takeProfit || !trade.stopLoss) {
      return 50; // Default to middle if data is missing
    }
    
    const current = parseFloat(trade.currentPrice);
    const entry = parseFloat(trade.entryPrice);
    const takeProfit = parseFloat(trade.takeProfit);
    const stopLoss = parseFloat(trade.stopLoss);
    
    const totalRange = Math.abs(takeProfit - stopLoss);
    if (totalRange === 0) return 50;
    
    const distanceFromStop = Math.abs(current - stopLoss);
    return Math.min(Math.max((distanceFromStop / totalRange) * 100, 0), 100);
  };

  // Mutation to stop a trade
  const stopTradeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/trades/${trade.id}/stop`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trade-activities"] });
      toast({
        title: "Trade stopped",
        description: `Your ${trade.symbol} trade has been stopped.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to stop trade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStopTrade = () => {
    stopTradeMutation.mutate();
    setIsStopDialogOpen(false);
  };

  const profitLoss = formatProfitLoss();

  return (
    <>
      <Card className={`overflow-hidden ${getBorderClass()}`}>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              {trade.symbol}
            </h3>
            <span className="badge-success">
              Active
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Entry Price</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                ${parseFloat(trade.entryPrice).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Price</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                ${parseFloat(trade.currentPrice || trade.entryPrice).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Position</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {trade.position}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">P/L</dt>
              <dd className={`mt-1 text-sm font-semibold ${profitLoss.class}`}>
                {profitLoss.text}
              </dd>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`${parseFloat(trade.profitLoss) >= 0 ? 'bg-success' : 'bg-destructive'} h-2 rounded-full`} 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-500 dark:text-slate-400">
                Take Profit: ${parseFloat(trade.takeProfit).toFixed(2)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Stop Loss: ${parseFloat(trade.stopLoss).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button
              variant="warning"
              className="flex-1"
              onClick={() => setIsEditDialogOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setIsStopDialogOpen(true)}
            >
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Trade Dialog */}
      <NewTradeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tradeToEdit={trade}
      />

      {/* Stop Trade Confirmation Dialog */}
      <AlertDialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop your {trade.symbol} trade. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleStopTrade}
            >
              Stop Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
