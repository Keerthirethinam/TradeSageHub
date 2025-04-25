import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, ArrowUp, ArrowDown, Settings, Key, Wallet, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => !data.newPassword || data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user's trades
  const { data: trades, isLoading: isLoadingTrades } = useQuery({
    queryKey: ["/api/trades"],
  });

  // Fetch trade activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/trade-activities"],
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", values);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
      form.reset({
        username: data.username,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };

  // Calculate trading statistics
  const tradingStats = React.useMemo(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return {
        totalTrades: 0,
        activeTrades: 0,
        successRate: 0,
        avgProfitPercent: 0,
        winningTrades: 0,
        losingTrades: 0,
        memberSince: "April 2025"
      };
    }

    const activeTrades = trades.filter(trade => trade.isActive).length;
    const closedTrades = trades.filter(trade => !trade.isActive).length;
    
    // Calculate success rate from closed trades
    const winningTrades = trades.filter(trade => 
      !trade.isActive && (trade.profitLoss && parseFloat(trade.profitLoss) > 0)
    ).length;
    
    const successRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;
    
    // Calculate average profit percentage
    const totalProfitPercent = trades
      .filter(trade => !trade.isActive)
      .reduce((sum, trade) => {
        if (!trade.entryPrice || !trade.exitPrice) return sum;
        const profitPercent = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
        return sum + profitPercent;
      }, 0);
    
    const avgProfitPercent = closedTrades > 0 ? totalProfitPercent / closedTrades : 0;
    
    // Get member since date from the first trade
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const firstTradeDate = sortedTrades.length > 0 
      ? new Date(sortedTrades[0].createdAt) 
      : new Date();
    
    const memberSince = firstTradeDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });

    return {
      totalTrades: trades.length,
      activeTrades,
      successRate,
      avgProfitPercent,
      winningTrades,
      losingTrades: closedTrades - winningTrades,
      memberSince
    };
  }, [trades]);

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "?";
    
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.reset({
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const isPending = updateProfileMutation.isPending;
  const isLoading = isLoadingTrades || isLoadingActivities;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button 
            variant="outline" 
            onClick={handleEdit}
            disabled={isEditing}
          >
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <AvatarFallback className="text-xl font-bold">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user?.username}</h2>
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full px-2 py-1 mt-1">
                {tradingStats.totalTrades > 50 ? "Expert Trader" : tradingStats.totalTrades > 10 ? "Experienced Trader" : "Beginner Trader"}
              </div>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <User className="w-5 h-5 mr-3 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Member since</p>
                    <p className="text-xs text-slate-500">{tradingStats.memberSince}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Wallet className="w-5 h-5 mr-3 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">{tradingStats.totalTrades} Total Trades</p>
                    <p className="text-xs text-slate-500">{tradingStats.activeTrades} active trades</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <BarChart3 className="w-5 h-5 mr-3 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-xs text-slate-500">{tradingStats.successRate.toFixed(1)}% success</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs Container */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Key className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={!isEditing || isPending}
                                />
                              </FormControl>
                              <FormDescription>
                                This is your public display name within the trading platform.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {isEditing && (
                          <div className="pt-4 flex space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleCancel}
                              disabled={isPending}
                            >
                              Cancel
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
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Performance</CardTitle>
                    <CardDescription>
                      View your trading statistics and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Success Rate */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <h3 className="text-sm font-medium">Success Rate</h3>
                            <span className="text-sm text-slate-500">{tradingStats.successRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={tradingStats.successRate} className="h-2" />
                        </div>
                        
                        {/* Trading Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border border-slate-200 dark:border-slate-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500">Winning Trades</p>
                                  <p className="text-2xl font-bold text-green-600">{tradingStats.winningTrades}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                  <ArrowUp className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-slate-200 dark:border-slate-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-slate-500">Losing Trades</p>
                                  <p className="text-2xl font-bold text-red-600">{tradingStats.losingTrades}</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-full">
                                  <ArrowDown className="h-5 w-5 text-red-600" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Average Performance */}
                        <Card className="border border-slate-200 dark:border-slate-700">
                          <CardContent className="p-4">
                            <h3 className="text-sm font-medium mb-2">Average Profit/Loss</h3>
                            <div className="flex items-center">
                              <span className={`text-xl font-bold ${tradingStats.avgProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tradingStats.avgProfitPercent >= 0 ? '+' : ''}{tradingStats.avgProfitPercent.toFixed(2)}%
                              </span>
                              <span className="text-sm text-slate-500 ml-2">per trade</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Change your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your current password" 
                                  {...field}
                                  disabled={isPending}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter new password" 
                                  {...field}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters long.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirmNewPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Confirm your new password" 
                                  {...field}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={isPending}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isPending || 
                              !form.getValues("currentPassword") || 
                              (!!form.getValues("newPassword") && !form.getValues("confirmNewPassword"))
                            }
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}