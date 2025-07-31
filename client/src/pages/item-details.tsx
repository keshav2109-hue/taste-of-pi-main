import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartButton } from "@/components/CartButton";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@shared/schema";

export default function ItemDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState("mild");
  const [addons, setAddons] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const { data: item, isLoading } = useQuery<MenuItem>({
    queryKey: ["/api/menu-items", id],
    enabled: !!id,
  });

  const availableAddons = [
    "Extra Cheese",
    "Mushrooms", 
    "Olives",
    "Pepperoni",
    "Bell Peppers",
    "Onions",
  ];

  const handleAddonChange = (addon: string, checked: boolean) => {
    if (checked) {
      setAddons(prev => [...prev, addon]);
    } else {
      setAddons(prev => prev.filter(a => a !== addon));
    }
  };

  const calculatePrice = () => {
    if (!item) return 0;
    const basePrice = parseFloat(item.price);
    const addonsPrice = addons.length * 2; // $2 per addon
    return (basePrice + addonsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem = {
      id: Date.now().toString(),
      menuItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity,
      customizations: {
        spiceLevel,
        addons: addons.length > 0 ? addons : undefined,
        specialInstructions: specialInstructions.trim() || undefined,
      },
    };

    addItem(cartItem);
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${item.name} added to your cart`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
            <Link href="/menu">
              <Button>Back to Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/menu">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={item.image}
              alt={item.name}
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-charcoal dark:text-white">
                {item.name}
              </h1>
              {!item.isAvailable && (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              {item.description}
            </p>

            <div className="space-y-6">
              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipe */}
              {item.recipe && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Preparation</h3>
                  <p className="text-muted-foreground">{item.recipe}</p>
                </div>
              )}

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((allergen) => (
                      <Badge key={allergen} variant="destructive">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Customize Your Order</h3>
                  
                  <div className="space-y-4">
                    {/* Spice Level */}
                    <div>
                      <Label className="text-base font-medium">Spice Level</Label>
                      <Select value={spiceLevel} onValueChange={setSpiceLevel}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="spicy">Spicy</SelectItem>
                          <SelectItem value="extra-spicy">Extra Spicy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add-ons */}
                    <div>
                      <Label className="text-base font-medium">Add-ons (+$2.00 each)</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableAddons.map((addon) => (
                          <div key={addon} className="flex items-center space-x-2">
                            <Checkbox
                              id={addon}
                              checked={addons.includes(addon)}
                              onCheckedChange={(checked) => 
                                handleAddonChange(addon, checked as boolean)
                              }
                            />
                            <Label htmlFor={addon} className="text-sm">
                              {addon}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <Label className="text-base font-medium">Special Instructions</Label>
                      <Textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any special requests..."
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Quantity</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-3xl font-bold text-terracotta">
                      ${calculatePrice().toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-terracotta hover:bg-terracotta/90 text-white"
                    onClick={handleAddToCart}
                    disabled={!item.isAvailable}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <CartButton />
      <ChatBot />
    </div>
  );
}
