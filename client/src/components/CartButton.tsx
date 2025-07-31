import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";

export function CartButton() {
  const { totalItems, totalAmount } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/cart">
        <Button
          size="lg"
          className="bg-terracotta hover:bg-terracotta/90 text-white shadow-lg rounded-full px-6 py-3"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {totalItems} item{totalItems !== 1 ? 's' : ''} - ${totalAmount.toFixed(2)}
        </Button>
      </Link>
    </div>
  );
}
