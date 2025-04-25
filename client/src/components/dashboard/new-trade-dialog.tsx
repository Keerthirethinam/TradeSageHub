import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  position: z.string().min(1, "Position is required"),
  quantity: z.string().min(1, "Quantity is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Quantity must be a positive number"
  ),
  entryPrice: z.string().min(1, "Entry price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Entry price must be a positive number"
  ),
  takeProfit: z.string().min(1, "Take profit is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Take profit must be a positive number"
  ),
  stopLoss: z.string().min(1, "Stop loss is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Stop loss must be a positive number"
  ),
  apiUsed: z.string().min(1, "Trading API is required"),
  notes: z.string().optional(),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface NewTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeToEdit?: any;
}

export default function NewTradeDialog({
  open,
  onOpenChange,
  tradeToEdit,
}: NewTradeDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!tradeToEdit;

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: "",
      position: "Long",
      quantity: "",
      entryPrice: "",
      takeProfit: "",
      stopLoss: "",
      apiUsed: "Binance",
      notes: "",
    },
  });

  // Set form values when editing a trade
  useEffect(() => {
    if (isEditMode && tradeToEdit) {
      form.reset({
        symbol: tradeToEdit.symbol,
        position: tradeToEdit.position,
        quantity: String(tradeToEdit.quantity),
        entryPrice: String(tradeToEdit.entryPrice),
        takeProfit: String(tradeToEdit.takeProfit),
        stopLoss: String(tradeToEdit.stopLoss),
        apiUsed: tradeToEdit.apiUsed || "Binance",
        notes: tradeToEdit.notes || "",
      });
    } else {
      form.reset({
        symbol: "",
        position: "Long",
        quantity: "",
        entryPrice: "",
        takeProfit: "",
        stopLoss: "",
        apiUsed: "Binance",
        notes: "",
      });
    }
  }, [form, isEditMode, tradeToEdit, open]);

  // Create trade mutation
  const createTradeMutation = useMutation({
    mutationFn: async (values: TradeFormValues) => {
      const res = await apiRequest("POST", "/api/trades", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trade-activities"] });
      toast({
        title: "Trade created",
        description: "Your trade has been started successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create trade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update trade mutation
  const updateTradeMutation = useMutation({
    mutationFn: async (values: TradeFormValues) => {
      const res = await apiRequest("PATCH", `/api/trades/${tradeToEdit.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trade-activities"] });
      toast({
        title: "Trade updated",
        description: "Your trade has been updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update trade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TradeFormValues) => {
    if (isEditMode) {
      updateTradeMutation.mutate(values);
    } else {
      createTradeMutation.mutate(values);
    }
  };

  const isPending = createTradeMutation.isPending || updateTradeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Trade" : "Start New Trade"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the parameters for your existing trade."
              : "Configure the parameters for your new trade."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trading pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                      <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                      <SelectItem value="XRP/USD">XRP/USD</SelectItem>
                      <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                      <SelectItem value="ADA/USD">ADA/USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Long">Long</SelectItem>
                        <SelectItem value="Short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="entryPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl>
                    <Input placeholder="40000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit</FormLabel>
                    <FormControl>
                      <Input placeholder="45000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input placeholder="38000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="apiUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trading API</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select API" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Binance">Binance</SelectItem>
                      <SelectItem value="Coinbase Pro">Coinbase Pro</SelectItem>
                      <SelectItem value="Kraken">Kraken</SelectItem>
                      <SelectItem value="Bitfinex">Bitfinex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this trade..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Starting..."}
                  </>
                ) : isEditMode ? (
                  "Update Trade"
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Start Trade
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
