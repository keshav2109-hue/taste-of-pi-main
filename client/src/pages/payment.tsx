import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Smartphone, QrCode, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function Payment() {
  const { orderId } = useParams();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | null>(null);
  const [upiMethod, setUpiMethod] = useState<"card" | "qr" | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}`, updates);
      return response.json();
    },
  });

  const handleCashPayment = () => {
    if (!orderId) return;
    
    updateOrderMutation.mutate({
      orderId,
      updates: {
        paymentMethod: "cash",
        paymentStatus: "completed",
        status: "received",
      }
    }, {
      onSuccess: () => {
        setPaymentCompleted(true);
        toast({
          title: "Payment Method Selected",
          description: "Cash on Counter selected. Your order has been confirmed!",
        });
      }
    });
  };

  const handleCardPayment = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast({
        title: "Card Details Required",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    if (!orderId) return;

    // Simulate payment processing
    updateOrderMutation.mutate({
      orderId,
      updates: {
        paymentMethod: "upi",
        paymentStatus: "completed",
        status: "received",
      }
    }, {
      onSuccess: () => {
        setPaymentCompleted(true);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
      }
    });
  };

  const handleQRPayment = () => {
    if (!orderId) return;
    
    // Simulate QR payment completion
    setTimeout(() => {
      updateOrderMutation.mutate({
        orderId,
        updates: {
          paymentMethod: "upi",
          paymentStatus: "completed",
          status: "received",
        }
      }, {
        onSuccess: () => {
          setPaymentCompleted(true);
          toast({
            title: "Payment Successful",
            description: "QR payment completed successfully!",
          });
        }
      });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <Link href="/menu">
              <Button>Back to Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your order #{order.billNumber} has been confirmed
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/receipt/${order.id}`}>
                <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
                  View Receipt
                </Button>
              </Link>
              <Link href={`/feedback/${order.id}`}>
                <Button variant="outline">
                  Leave Feedback
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  const qrPaymentUrl = `upi://pay?pa=tasteofpi@upi&pn=Taste%20of%20Pi&am=${order.totalAmount}&cu=INR&tn=Order%20${order.billNumber}`;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/checkout">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Checkout
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    className={`h-20 ${paymentMethod === "cash" ? "bg-terracotta hover:bg-terracotta/90" : ""}`}
                    onClick={() => {
                      setPaymentMethod("cash");
                      setUpiMethod(null);
                    }}
                  >
                    <div className="text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-2" />
                      <span>Cash on Counter</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant={paymentMethod === "upi" ? "default" : "outline"}
                    className={`h-20 ${paymentMethod === "upi" ? "bg-terracotta hover:bg-terracotta/90" : ""}`}
                    onClick={() => {
                      setPaymentMethod("upi");
                    }}
                  >
                    <div className="text-center">
                      <Smartphone className="w-6 h-6 mx-auto mb-2" />
                      <span>UPI Payment</span>
                    </div>
                  </Button>
                </div>

                {paymentMethod === "cash" && (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Cash on Counter</h3>
                    <p className="text-muted-foreground mb-4">
                      Pay when you collect your order at our counter
                    </p>
                    <Button
                      onClick={handleCashPayment}
                      className="bg-terracotta hover:bg-terracotta/90 text-white"
                      disabled={updateOrderMutation.isPending}
                    >
                      {updateOrderMutation.isPending ? "Processing..." : "Confirm Order"}
                    </Button>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <Tabs value={upiMethod || "card"} onValueChange={setUpiMethod as any}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card">Card Details</TabsTrigger>
                      <TabsTrigger value="qr">QR Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="card" className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            value={cardDetails.number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardDetails(prev => ({ ...prev, number: formatted }));
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              const formatted = value.replace(/(\d{2})(?=\d)/, '$1/');
                              setCardDetails(prev => ({ ...prev, expiry: formatted }));
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                              setCardDetails(prev => ({ ...prev, cvv: value }));
                            }}
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCardPayment}
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                        disabled={updateOrderMutation.isPending}
                      >
                        {updateOrderMutation.isPending ? "Processing..." : `Pay $${order.totalAmount}`}
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="qr" className="text-center space-y-4">
                      <div className="flex justify-center">
                        <QRCodeGenerator 
                          value={qrPaymentUrl}
                          size={200}
                        />
                      </div>
                      <p className="text-muted-foreground">
                        Scan the QR code with your UPI app to complete the payment
                      </p>
                      <Button
                        onClick={handleQRPayment}
                        variant="outline"
                        className="w-full"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        I have completed the payment
                      </Button>
                    </TabsContent>
                  </Tabs>
                )}
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
                <div className="flex justify-between items-center">
                  <span>Order Number</span>
                  <Badge variant="outline">{order.billNumber}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="text-right">{order.customerName}</span>
                  </div>
                  
                  {order.couponNumber && (
                    <div className="flex justify-between">
                      <span>Coupon</span>
                      <Badge variant="secondary">{order.couponNumber}</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-terracotta">${order.totalAmount}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Your order will be prepared once payment is confirmed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
