import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
      <Link href={`/item/${item.id}`}>
        <div className="aspect-video overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-charcoal dark:text-white line-clamp-1">
            {item.name}
          </h3>
          {!item.isAvailable && (
            <Badge variant="destructive">Unavailable</Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.allergens.slice(0, 3).map((allergen) => (
              <Badge key={allergen} variant="secondary" className="text-xs">
                {allergen}
              </Badge>
            ))}
            {item.allergens.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.allergens.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-terracotta">
            ${parseFloat(item.price).toFixed(2)}
          </span>
          <Link href={`/item/${item.id}`}>
            <Button 
              className="bg-terracotta hover:bg-terracotta/90 text-white"
              disabled={!item.isAvailable}
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
