import { Link } from "wouter";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some delicious items from our menu!
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/menu">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Your Cart</h1>
          </div>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemTotal = (item.price + (item.customizations.addons?.length || 0) * 2) * item.quantity;
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Base Price: ${item.price.toFixed(2)}
                        </p>
                        
                        {/* Customizations */}
                        <div className="space-y-2 mb-4">
                          {item.customizations.spiceLevel && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                Spice: {item.customizations.spiceLevel}
                              </Badge>
                            </div>
                          )}
                          
                          {item.customizations.addons && item.customizations.addons.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground">Add-ons (+$2.00 each):</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.customizations.addons.map((addon) => (
                                  <Badge key={addon} variant="secondary">
                                    {addon}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.customizations.specialInstructions && (
                            <div>
                              <p className="text-sm text-muted-foreground">Special Instructions:</p>
                              <p className="text-sm">{item.customizations.specialInstructions}</p>
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-lg font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-terracotta">
                          ${itemTotal.toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive mt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(totalAmount * 0.08).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-terracotta">
                      ${(totalAmount * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-terracotta hover:bg-terracotta/90 text-white">
                    Proceed to Checkout
                  </Button>
                </Link>
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
