import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertOrder } from "@shared/schema";

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState(() => {
    const stored = localStorage.getItem("customer-info");
    if (stored) {
      try {
        return JSON.parse(stored).name || "";
      } catch {
        return "";
      }
    }
    return user?.name || "";
  });
  
  const [couponCode, setCouponCode] = useState(() => {
    const stored = localStorage.getItem("customer-info");
    if (stored) {
      try {
        return JSON.parse(stored).couponCode || "";
      } catch {
        return "";
      }
    }
    return "";
  });
  
  const [specialInstructions, setSpecialInstructions] = useState("");

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      clearCart();
      toast({
        title: "Order Placed Successfully",
        description: `Order #${order.billNumber} has been created`,
      });
      window.location.href = `/payment/${order.id}`;
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    const orderData: InsertOrder = {
      userId: user?.id,
      customerName: customerName.trim(),
      couponNumber: couponCode.trim() || undefined,
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
      })),
      totalAmount: (totalAmount * 1.08).toFixed(2), // Including tax
      paymentMethod: "pending", // Will be set in payment page
      specialInstructions: specialInstructions.trim() || undefined,
    };

    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some items to proceed with checkout
            </p>
            <Link href="/menu">
              <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                    <Input
                      id="couponCode"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests for your order..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const itemTotal = (item.price + (item.customizations.addons?.length || 0) * 2) * item.quantity;
                      
                      return (
                        <div key={item.id}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                              
                              {item.customizations.spiceLevel && (
                                <p className="text-sm text-muted-foreground">
                                  Spice Level: {item.customizations.spiceLevel}
                                </p>
                              )}
                              
                              {item.customizations.addons && item.customizations.addons.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Add-ons: {item.customizations.addons.join(", ")} (+${(item.customizations.addons.length * 2).toFixed(2)})
                                </p>
                              )}
                              
                              {item.customizations.specialInstructions && (
                                <p className="text-sm text-muted-foreground">
                                  Note: {item.customizations.specialInstructions}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${itemTotal.toFixed(2)}</p>
                            </div>
                          </div>
                          {index < items.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>${(totalAmount * 0.08).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-terracotta">
                        ${(totalAmount * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                    disabled={createOrderMutation.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createOrderMutation.isPending ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
