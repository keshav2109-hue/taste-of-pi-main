import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Send, Settings, Users, ShoppingBag, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order, Feedback, OrderItem } from "@shared/schema";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: feedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: isAuthenticated,
  });

  const verifyPasscodeMutation = useMutation({
    mutationFn: async (passcode: string) => {
      const response = await apiRequest("POST", "/api/admin/verify", { passcode });
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel",
      });
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid admin passcode",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ orderId, message }: { orderId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/admin/notify", { orderId, message });
      return response.json();
    },
    onSuccess: () => {
      setNotificationMessage("");
      toast({
        title: "Notification Sent",
        description: "Customer has been notified",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPasscodeMutation.mutate(passcode);
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ orderId, updates: { status } });
  };

  const handleSendNotification = (orderId: string) => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a notification message",
        variant: "destructive",
      });
      return;
    }
    sendNotificationMutation.mutate({ orderId, message: notificationMessage.trim() });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="passcode">Admin Passcode</Label>
                  <Input
                    id="passcode"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                  disabled={verifyPasscodeMutation.isPending}
                >
                  {verifyPasscodeMutation.isPending ? "Verifying..." : "Access Admin Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = {
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(o => o.status === "received" || o.status === "preparing").length || 0,
    completedOrders: orders?.filter(o => o.status === "completed").length || 0,
    totalRevenue: orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0,
    averageRating: feedback?.length ? 
      feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0,
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="outline">Taste of π Admin</Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingBag className="w-8 h-8 text-terracotta" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center text-white font-bold">$</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 20).map((order) => {
                      const items = order.items as OrderItem[];
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold">#{order.billNumber}</p>
                                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                              </div>
                              <Badge className={`text-white ${getStatusColor(order.status!)}`}>
                                {order.status}
                              </Badge>
                              <Badge className={`text-white ${getPaymentStatusColor(order.paymentStatus!)}`}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-terracotta">${order.totalAmount}</p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Order Details - #{order.billNumber}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium">Customer</p>
                                        <p>{order.customerName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Date</p>
                                        <p>{new Date(order.createdAt!).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Payment Method</p>
                                        <p className="capitalize">{order.paymentMethod}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Total</p>
                                        <p className="font-bold">${order.totalAmount}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-medium mb-2">Items</p>
                                      <div className="space-y-2">
                                        {items.map((item, index) => (
                                          <div key={index} className="bg-muted p-3 rounded">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                            {item.customizations.spiceLevel && (
                                              <p className="text-xs text-muted-foreground">Spice: {item.customizations.spiceLevel}</p>
                                            )}
                                            {item.customizations.addons?.length && (
                                              <p className="text-xs text-muted-foreground">Add-ons: {item.customizations.addons.join(", ")}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {order.specialInstructions && (
                                      <div>
                                        <p className="text-sm font-medium">Special Instructions</p>
                                        <p className="text-muted-foreground">{order.specialInstructions}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Status:</Label>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusUpdate(order.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Input
                                placeholder="Notification message..."
                                value={notificationMessage}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                                className="w-64"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSendNotification(order.id)}
                                disabled={sendNotificationMutation.isPending}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback && feedback.length > 0 ? (
                  <div className="space-y-6">
                    {feedback.slice(0, 20).map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-medium">{item.customerName}</p>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < item.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </div>
                                ))}
                              </div>
                              <Badge variant="outline">{item.rating}/5</Badge>
                            </div>
                            {item.comment && (
                              <p className="text-muted-foreground">{item.comment}</p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No feedback available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
