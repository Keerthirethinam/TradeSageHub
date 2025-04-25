import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Settings, BellRing, Shield, Clock, Globe, Sun, Moon, ChevronRight, AlertTriangle, Check, LinkIcon, BarChart3 } from "lucide-react";
import { SiBinance, SiCoinbase } from "react-icons/si";
import { FaExchangeAlt } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  isTestnet: z.boolean().optional().default(true),
  notes: z.string().optional(),
});

// Define the app settings schema
const appSettingsSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  autoTradingEnabled: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["en", "es", "fr", "de", "ja", "zh"]).default("en"),
  defaultCurrency: z.enum(["USD", "EUR", "GBP", "JPY", "INR"]).default("USD"),
  timeZone: z.string().default("UTC"),
  tradingLimits: z.object({
    maxTradeAmount: z.number().default(1000),
    dailyLimit: z.number().default(5000),
  }),
});

// Define security settings schema
const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(1440).default(60),
  ipWhitelist: z.array(z.string()).default([]),
});

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState("api");
  const [currentApiService, setCurrentApiService] = useState("binance");
  const { toast } = useToast();
  const { user } = useAuth();
  
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

  // Initialize app settings form
  const appSettingsForm = useForm<z.infer<typeof appSettingsSchema>>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: {
      notificationsEnabled: true,
      emailNotifications: true,
      autoTradingEnabled: false,
      theme: "system",
      language: "en",
      defaultCurrency: "USD",
      timeZone: "UTC",
      tradingLimits: {
        maxTradeAmount: 1000,
        dailyLimit: 5000,
      },
    },
  });

  // Initialize security settings form
  const securitySettingsForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorEnabled: false,
      sessionTimeout: 60,
      ipWhitelist: [],
    },
  });

  // Save general settings mutation
  const saveGeneralSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof appSettingsSchema>) => {
      const res = await apiRequest("POST", "/api/settings/general", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "General settings saved",
        description: "Your application settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save security settings mutation
  const saveSecuritySettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof securitySettingsSchema>) => {
      const res = await apiRequest("POST", "/api/settings/security", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Security settings saved",
        description: "Your security settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save security settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitAppSettings = (values: z.infer<typeof appSettingsSchema>) => {
    saveGeneralSettingsMutation.mutate(values);
  };

  const onSubmitSecuritySettings = (values: z.infer<typeof securitySettingsSchema>) => {
    saveSecuritySettingsMutation.mutate(values);
  };

  const isPending = saveApiConfigMutation.isPending || 
                    saveGeneralSettingsMutation.isPending || 
                    saveSecuritySettingsMutation.isPending;
  
  const currentForm = getCurrentForm();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="api">
              <LinkIcon className="h-4 w-4 mr-2" />
              API Connections
            </TabsTrigger>
            <TabsTrigger value="app">
              <Settings className="h-4 w-4 mr-2" />
              Application
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* API Settings Tab */}
        {currentTab === "api" && (
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
        )}

        {/* Application Settings Tab */}
        {currentTab === "app" && (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Customize your trading platform experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...appSettingsForm}>
                  <form onSubmit={appSettingsForm.handleSubmit(onSubmitAppSettings)} className="space-y-6">
                    {/* Notifications Section */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-4 flex items-center">
                        <BellRing className="h-5 w-5 mr-2 text-primary" />
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          control={appSettingsForm.control}
                          name="notificationsEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Enable Notifications</FormLabel>
                                <FormDescription>
                                  Receive trading alerts and platform updates
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
                          control={appSettingsForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!appSettingsForm.getValues("notificationsEnabled")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Appearance Section */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-4 flex items-center">
                        <Sun className="h-5 w-5 mr-2 text-primary" />
                        Appearance & Localization
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={appSettingsForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System Default</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose your preferred display theme
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appSettingsForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Español</SelectItem>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="de">Deutsch</SelectItem>
                                  <SelectItem value="ja">日本語</SelectItem>
                                  <SelectItem value="zh">中文</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Interface language
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appSettingsForm.control}
                          name="defaultCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Currency</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                                  <SelectItem value="INR">INR (₹)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Currency used for displaying values
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appSettingsForm.control}
                          name="timeZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Zone</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time zone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTC">UTC</SelectItem>
                                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                  <SelectItem value="Europe/London">London</SelectItem>
                                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                  <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                                  <SelectItem value="Asia/Kolkata">India</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Time zone for displaying dates and times
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Trading Preferences */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                        Trading Preferences
                      </h3>
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="autoTradingEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Auto Trading</FormLabel>
                              <FormDescription>
                                Enable automated trading based on your strategy
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
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={appSettingsForm.control}
                          name="tradingLimits.maxTradeAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Trade Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum amount per trade in {appSettingsForm.getValues("defaultCurrency")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appSettingsForm.control}
                          name="tradingLimits.dailyLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Trading Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum daily trading volume in {appSettingsForm.getValues("defaultCurrency")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isPending}>
                      {saveGeneralSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Application Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings Tab */}
        {currentTab === "security" && (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Enhance the security of your trading account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securitySettingsForm}>
                  <form onSubmit={securitySettingsForm.handleSubmit(onSubmitSecuritySettings)} className="space-y-6">
                    <Alert className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Security Notice</AlertTitle>
                      <AlertDescription>
                        Strong security settings are recommended to protect your trading account. 
                        Two-factor authentication can significantly enhance your account security.
                      </AlertDescription>
                    </Alert>
                    
                    <FormField
                      control={securitySettingsForm.control}
                      name="twoFactorEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Two-Factor Authentication
                            </FormLabel>
                            <FormDescription>
                              Add an extra layer of security to your account
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
                      control={securitySettingsForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                              min={5}
                              max={1440}
                            />
                          </FormControl>
                          <FormDescription>
                            Automatically log out after inactivity (5-1440 minutes)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securitySettingsForm.control}
                      name="ipWhitelist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Whitelist (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter IP addresses, one per line"
                              className="resize-y"
                              value={field.value.join('\n')}
                              onChange={(e) => {
                                const ips = e.target.value.split('\n').filter(ip => ip.trim().length > 0);
                                field.onChange(ips);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Restrict access to specific IP addresses (leave empty to allow all)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4">
                      <Button type="submit" disabled={isPending}>
                        {saveSecuritySettingsMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Security Settings"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}