import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingCart, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { LoginModal } from "./LoginModal";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/feedback", label: "Feedback" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-charcoal dark:text-white">
                Taste of <span className="text-terracotta">π</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-terracotta ${
                    isActive(item.href)
                      ? "text-terracotta"
                      : "text-charcoal dark:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Cart Button */}
              <Link href="/cart">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terracotta text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-sm text-muted-foreground">
                    {user.name}
                  </span>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-terracotta ${
                    isActive(item.href)
                      ? "text-terracotta"
                      : "text-charcoal dark:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
