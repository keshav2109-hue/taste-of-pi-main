import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import Footer from "@/components/Footer";
import { CartButton } from "@/components/CartButton";
import { ChatBot } from "@/components/ChatBot";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MenuSection />
      <Footer />
      <CartButton />
      <ChatBot />
    </div>
  );
}
