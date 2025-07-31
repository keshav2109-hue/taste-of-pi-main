import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { MenuItemCard } from "@/components/MenuItemCard";
import Footer from "@/components/Footer";
import { CartButton } from "@/components/CartButton";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem, Category } from "@shared/schema";

export default function Menu() {
  const { category } = useParams();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items", category || "all"],
    queryFn: async () => {
      const url = category ? `/api/menu-items?category=${category}` : "/api/menu-items";
      const response = await fetch(url);
      return response.json();
    },
  });

  const currentCategory = categories?.find(cat => cat.id === category);

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal dark:text-white mb-4">
            {currentCategory ? currentCategory.name : "Our Menu"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentCategory?.description || "Discover our collection of authentic Italian dishes"}
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={!category ? "default" : "outline"}
            className={!category ? "bg-terracotta hover:bg-terracotta/90" : ""}
            onClick={() => window.location.href = "/menu"}
          >
            All Items
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              className={category === cat.id ? "bg-terracotta hover:bg-terracotta/90" : ""}
              onClick={() => window.location.href = `/menu/${cat.id}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems?.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {menuItems?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
      <CartButton />
      <ChatBot />
    </div>
  );
}
