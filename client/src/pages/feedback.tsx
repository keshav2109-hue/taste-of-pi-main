import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Feedback, Order } from "@shared/schema";

export default function FeedbackPage() {
  const { orderId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const { data: order } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { data: allFeedback, isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: {
      orderId?: string;
      customerName: string;
      rating: number;
      comment?: string;
    }) => {
      const response = await apiRequest("POST", "/api/feedback", feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully",
      });
      setCustomerName("");
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      orderId: orderId || undefined,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const renderStars = (rating: number, interactive = false, size = "w-6 h-6") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            className={`${size} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            disabled={!interactive}
          >
            <Star
              className={`w-full h-full ${
                star <= (interactive ? (hoverRating || rating) : rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          {orderId ? (
            <Link href={`/receipt/${orderId}`}>
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Receipt
              </Button>
            </Link>
          ) : (
            <Link href="/menu">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          )}
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                {order && (
                  <p className="text-muted-foreground">
                    Order #{order.billNumber} - {order.customerName}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="customerName">Your Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      defaultValue={order?.customerName}
                      required
                    />
                  </div>

                  <div>
                    <Label>Rating *</Label>
                    <div className="mt-2">
                      {renderStars(rating, true)}
                      <p className="text-sm text-muted-foreground mt-2">
                        {rating === 0 && "Please select a rating"}
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Comments (Optional)</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {orderId && (
              <div className="mt-6 text-center">
                <Link href={`/receipt/${orderId}`}>
                  <Button variant="outline" className="mr-4">
                    View Receipt
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Previous Feedback */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : allFeedback && allFeedback.length > 0 ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {allFeedback.slice(0, 10).map((feedback) => (
                      <div key={feedback.id}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{feedback.customerName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(feedback.rating, false, "w-4 h-4")}
                              <Badge variant="outline" className="text-xs">
                                {feedback.rating}/5
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(feedback.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-muted-foreground">
                            "{feedback.comment}"
                          </p>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to leave feedback!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
