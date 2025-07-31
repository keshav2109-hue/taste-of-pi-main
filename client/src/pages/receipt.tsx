import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Printer, Star, Home } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order, OrderItem } from "@shared/schema";

export default function Receipt() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!order) return;
    
    const receiptContent = generateReceiptText(order);
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.billNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReceiptText = (order: Order) => {
    const items = order.items as OrderItem[];
    let receipt = `
TASTE OF π - RECEIPT
====================
Bill Number: ${order.billNumber}
Date: ${new Date(order.createdAt!).toLocaleString()}
Customer: ${order.customerName}
${order.couponNumber ? `Coupon: ${order.couponNumber}\n` : ''}
--------------------
ITEMS:
`;

    items.forEach((item) => {
      const itemTotal = (item.price + (item.customizations.addons?.length || 0) * 2) * item.quantity;
      receipt += `
${item.name}
Qty: ${item.quantity} x $${item.price.toFixed(2)}
`;
      
      if (item.customizations.spiceLevel) {
        receipt += `Spice: ${item.customizations.spiceLevel}\n`;
      }
      
      if (item.customizations.addons?.length) {
        receipt += `Add-ons: ${item.customizations.addons.join(", ")} (+$${(item.customizations.addons.length * 2).toFixed(2)})\n`;
      }
      
      if (item.customizations.specialInstructions) {
        receipt += `Note: ${item.customizations.specialInstructions}\n`;
      }
      
      receipt += `Total: $${itemTotal.toFixed(2)}\n`;
    });

    const subtotal = parseFloat(order.totalAmount) / 1.08;
    const tax = parseFloat(order.totalAmount) - subtotal;

    receipt += `
--------------------
Subtotal: $${subtotal.toFixed(2)}
Tax (8%): $${tax.toFixed(2)}
TOTAL: $${order.totalAmount}

Payment: ${order.paymentMethod.toUpperCase()}
Status: ${order.paymentStatus.toUpperCase()}

${order.specialInstructions ? `Special Instructions:\n${order.specialInstructions}\n\n` : ''}
Thank you for dining with us!
Taste of π - Authentic Italian Cuisine
123 Italian Way, Little Italy, NY 10013
(555) 123-PIZZA
info@tasteofpi.com
    `;

    return receipt;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p>Loading receipt...</p>
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
            <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
            <Link href="/menu">
              <Button>Back to Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = order.items as OrderItem[];
  const subtotal = parseFloat(order.totalAmount) / 1.08;
  const tax = parseFloat(order.totalAmount) - subtotal;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="flex items-center">
            <Link href="/payment">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Receipt</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Receipt */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Taste of <span className="text-terracotta">π</span>
              </h2>
              <p className="text-muted-foreground">Authentic Italian Cuisine</p>
              <p className="text-sm text-muted-foreground mt-2">
                123 Italian Way, Little Italy, NY 10013<br />
                (555) 123-PIZZA | info@tasteofpi.com
              </p>
            </div>

            <Separator className="mb-6" />

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Bill Number</p>
                <p className="font-semibold">{order.billNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {new Date(order.createdAt!).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge variant="outline" className="capitalize">
                  {order.paymentMethod}
                </Badge>
              </div>
            </div>

            {order.couponNumber && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Coupon Used</p>
                <Badge variant="secondary">{order.couponNumber}</Badge>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Items */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Order Items</h3>
              {items.map((item, index) => {
                const itemTotal = (item.price + (item.customizations.addons?.length || 0) * 2) * item.quantity;
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                      
                      {item.customizations.spiceLevel && (
                        <p>Spice Level: <span className="capitalize">{item.customizations.spiceLevel}</span></p>
                      )}
                      
                      {item.customizations.addons && item.customizations.addons.length > 0 && (
                        <p>Add-ons: {item.customizations.addons.join(", ")} (+${(item.customizations.addons.length * 2).toFixed(2)})</p>
                      )}
                      
                      {item.customizations.specialInstructions && (
                        <p>Note: {item.customizations.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.specialInstructions && (
              <>
                <Separator className="mb-4" />
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                  <p className="text-muted-foreground">{order.specialInstructions}</p>
                </div>
              </>
            )}

            <Separator className="mb-6" />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-terracotta">${order.totalAmount}</span>
              </div>
            </div>

            <div className="text-center mt-8 text-sm text-muted-foreground">
              <p>Thank you for dining with us!</p>
              <p>We hope you enjoyed your meal.</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8 print:hidden">
          <Link href={`/feedback/${order.id}`}>
            <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
              <Star className="w-4 h-4 mr-2" />
              Leave Feedback
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
