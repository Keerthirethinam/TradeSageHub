import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { SiBinance, SiCoinbase } from "react-icons/si";
import { FaExchangeAlt } from "react-icons/fa";

const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  isTestnet: z.boolean().optional().default(true),
  notes: z.string().optional(),
});

export default function SettingsPage() {
  const [currentApiService, setCurrentApiService] = useState("binance");
  const { toast } = useToast();
  
  // Create a form for each API service
  const binanceForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      isTestnet: true,
      notes: "",
    },
  });
  
  const coinbaseForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      isTestnet: true,
      notes: "",
    },
  });
  
  const krakenForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      isTestnet: true,
      notes: "",
    },
  });
  
  const bitfinexForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      isTestnet: true,
      notes: "",
    },
  });

  const icicidirectForm = useForm<z.infer<typeof apiConfigSchema>>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      isTestnet: true,
      notes: "",
    },
  });
  
  // Get the current form based on the selected API service
  const getCurrentForm = () => {
    switch (currentApiService) {
      case "binance":
        return binanceForm;
      case "coinbase":
        return coinbaseForm;
      case "kraken":
        return krakenForm;
      case "bitfinex":
        return bitfinexForm;
      case "icicidirect":
        return icicidirectForm;
      default:
        return binanceForm;
    }
  };

  // Save API configuration mutation
  const saveApiConfigMutation = useMutation({
    mutationFn: async (values: z.infer<typeof apiConfigSchema>) => {
      const res = await apiRequest("POST", `/api/settings/api/${currentApiService}`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API settings saved",
        description: `Your ${getApiServiceName(currentApiService)} API configuration has been saved successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save API settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof apiConfigSchema>) => {
    saveApiConfigMutation.mutate(values);
  };

  // Test API connection
  const testApiConnection = () => {
    toast({
      title: "Testing API Connection",
      description: "This feature is not implemented yet.",
    });
  };

  // Get the icon and name for the API service
  const getApiServiceIcon = (service: string) => {
    switch (service) {
      case "binance":
        return <SiBinance className="h-6 w-6 text-yellow-500" />;
      case "coinbase":
        return <SiCoinbase className="h-6 w-6 text-blue-500" />;
      case "kraken":
        return <FaExchangeAlt className="h-6 w-6 text-purple-500" />;
      case "bitfinex":
        return <FaExchangeAlt className="h-6 w-6 text-green-500" />;
      case "icicidirect":
        return <FaExchangeAlt className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getApiServiceName = (service: string) => {
    switch (service) {
      case "binance":
        return "Binance";
      case "coinbase":
        return "Coinbase Pro";
      case "kraken":
        return "Kraken";
      case "bitfinex":
        return "Bitfinex";
      case "icicidirect":
        return "ICICI Direct";
      default:
        return "";
    }
  };

  const isPending = saveApiConfigMutation.isPending;
  const currentForm = getCurrentForm();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">API Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* API Services Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Trading APIs</CardTitle>
              <CardDescription>
                Configure your trading API connections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {["binance", "coinbase", "kraken", "bitfinex", "icicidirect"].map((service) => (
                  <Button
                    key={service}
                    variant={currentApiService === service ? "default" : "ghost"}
                    className="w-full justify-start px-4 py-2"
                    onClick={() => setCurrentApiService(service)}
                  >
                    <div className="flex items-center">
                      {getApiServiceIcon(service)}
                      <span className="ml-2">{getApiServiceName(service)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* API Configuration Form */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center">
                {getApiServiceIcon(currentApiService)}
                <CardTitle className="text-lg ml-2">
                  {getApiServiceName(currentApiService)} API Configuration
                </CardTitle>
              </div>
              <CardDescription>
                Enter your API credentials for {getApiServiceName(currentApiService)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...currentForm}>
                <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={currentForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your API key" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The API key provided by {getApiServiceName(currentApiService)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={currentForm.control}
                    name="apiSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Enter your API secret" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your API secret will be encrypted and stored securely
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={currentForm.control}
                    name="isTestnet"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Use Testnet
                          </FormLabel>
                          <FormDescription>
                            Enable this to use the {getApiServiceName(currentApiService)} testnet for paper trading
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={currentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Add any notes about this API connection" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={testApiConnection}
                      disabled={
                        isPending || 
                        !currentForm.getValues("apiKey") || 
                        !currentForm.getValues("apiSecret")
                      }
                    >
                      Test Connection
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <p><strong>Note:</strong> Make sure to use API keys with appropriate permissions. 
                It's recommended to limit your API keys to only have the permissions needed for trading.</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}