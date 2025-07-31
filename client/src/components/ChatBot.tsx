import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant for Taste of π. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqResponses: Record<string, string> = {
    "hours": "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm.",
    "location": "We're located at 123 Italian Way, Little Italy, NY 10013.",
    "phone": "You can call us at (555) 123-PIZZA.",
    "delivery": "We offer delivery through our website. You can place an order online and choose delivery or pickup.",
    "allergens": "All our menu items list allergens. Please check the item details or ask your server about specific dietary restrictions.",
    "reservations": "For reservations, please call us at (555) 123-PIZZA or use our online booking system.",
    "payment": "We accept cash, all major credit cards, and UPI payments through our app.",
    "menu": "You can view our full menu on the website. We serve authentic Italian cuisine including pasta, pizza, appetizers, and desserts.",
    "ingredients": "We use only the finest imported Italian ingredients and locally sourced fresh produce.",
    "specials": "We have daily specials! Check with your server or view our specials section on the menu.",
  };

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }
    
    // Default responses for common patterns
    if (message.includes("hello") || message.includes("hi")) {
      return "Hello! Welcome to Taste of π. How can I assist you today?";
    }
    
    if (message.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (message.includes("order")) {
      return "To place an order, you can browse our menu and add items to your cart. Would you like me to help you find something specific?";
    }
    
    return "I'm here to help with questions about our restaurant, menu, hours, location, and services. Could you please be more specific about what you'd like to know?";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getAIResponse(inputMessage.trim()),
      isBot: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="bg-terracotta hover:bg-terracotta/90 text-white rounded-full shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96">
      <Card className="shadow-xl">
        <CardHeader className="bg-terracotta text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Taste of π Assistant</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-terracotta text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-terracotta hover:bg-terracotta/90"
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
