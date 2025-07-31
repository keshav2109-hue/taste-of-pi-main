import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white py-12 dark:bg-background dark:border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Taste of <span className="text-terracotta">π</span>
            </h3>
            <p className="text-white/80 dark:text-muted-foreground">
              Authentic Italian cuisine crafted with passion and tradition.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-white/80 dark:text-muted-foreground">
              <p>123 Italian Way</p>
              <p>Little Italy, NY 10013</p>
              <p>(555) 123-PIZZA</p>
              <p>info@tasteofpi.com</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 dark:border-border mt-8 pt-8 text-center">
          <p className="text-white/60 dark:text-muted-foreground">
            &copy; {currentYear} Taste of π. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
