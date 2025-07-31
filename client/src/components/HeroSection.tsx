import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerInfoModal } from "./CustomerInfoModal";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const { data: config } = useQuery({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    // Show customer info modal on first visit
    const hasVisited = localStorage.getItem("taste-of-pi-visited");
    if (!hasVisited) {
      setShowCustomerModal(true);
      localStorage.setItem("taste-of-pi-visited", "true");
    }
  }, []);

  useEffect(() => {
   if (config && 'youtubeVideoUrl' in config && config.youtubeVideoUrl) {
      setYoutubeUrl(config.youtubeVideoUrl);
    }
  }, [config]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : "";
  };

  return (
    <>
      <section className="bg-gradient-to-br from-warm-cream to-background py-20 dark:from-background dark:to-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Website Name */}
          <h1 className="text-6xl md:text-8xl font-bold text-charcoal dark:text-white mb-8">
            Taste of <span className="text-terracotta">π</span>
          </h1>
          
          {/* Logo */}
          <div className="mb-12">
            <div className="w-32 h-32 mx-auto bg-terracotta rounded-full flex items-center justify-center shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 text-white"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <p className="text-xl text-muted-foreground mt-4 font-light">
              Authentic Italian Cuisine
            </p>
          </div>

          {/* YouTube Video Embed */}
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-xl">
              {youtubeUrl ? (
                <iframe
                  src={getYouTubeEmbedUrl(youtubeUrl)}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Restaurant Video"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/90 text-white">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg mb-2">Restaurant Experience Video</p>
                    <p className="text-sm opacity-75">
                      Video will be displayed when YouTube URL is configured
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-terracotta hover:bg-terracotta/90 text-white"
              onClick={() => window.location.href = "/menu"}
            >
              View Our Menu
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowCustomerModal(true)}
            >
              Customer Info
            </Button>
          </div>
        </div>
      </section>

      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </>
  );
}
