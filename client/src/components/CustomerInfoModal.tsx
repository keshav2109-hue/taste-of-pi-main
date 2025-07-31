import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerInfoModal({ isOpen, onClose }: CustomerInfoModalProps) {
  const [name, setName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const { toast } = useToast();

  const checkCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("GET", `/api/coupons/check/${code}`);
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    // Validate coupon if provided
    if (couponCode.trim()) {
      try {
        await checkCouponMutation.mutateAsync(couponCode.trim());
        toast({
          title: "Valid Coupon",
          description: "Coupon code verified successfully",
        });
      } catch (error) {
        toast({
          title: "Invalid Coupon",
          description: "The coupon code is invalid or already used",
          variant: "destructive",
        });
        return;
      }
    }

    // Store customer info
    localStorage.setItem("customer-info", JSON.stringify({
      name: name.trim(),
      couponCode: couponCode.trim(),
    }));

    toast({
      title: "Welcome!",
      description: `Hello ${name.trim()}, enjoy browsing our menu!`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to Taste of π
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="coupon">Coupon Code (Optional)</Label>
            <Input
              id="coupon"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Have a coupon? Enter it to get special offers!
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
              disabled={checkCouponMutation.isPending}
            >
              {checkCouponMutation.isPending ? "Validating..." : "Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
