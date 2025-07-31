import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertFeedbackSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Menu Items
  app.get("/api/menu-items", async (req, res) => {
    try {
      const { category } = req.query;
      let items;
      
      if (category && typeof category === 'string') {
        items = await storage.getMenuItemsByCategory(category);
      } else {
        items = await storage.getMenuItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // If coupon is provided, mark it as used
      if (orderData.couponNumber) {
        const coupon = await storage.getCouponByCode(orderData.couponNumber);
        if (coupon) {
          await storage.markCouponAsUsed(coupon.id);
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const { userId } = req.query;
      let orders;
      
      if (userId && typeof userId === 'string') {
        orders = await storage.getUserOrders(userId);
      } else {
        orders = await storage.getOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      const order = await storage.updateOrder(req.params.id, { status, paymentStatus });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Coupons
  app.get("/api/coupons/check/:code", async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
      if (coupon.isUsed) {
        return res.status(400).json({ message: "Coupon already used" });
      }
      res.json({ valid: true, coupon });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // Admin routes
  app.post("/api/admin/verify", async (req, res) => {
    try {
      const { passcode } = req.body;
      if (passcode === "RBKGSB") {
        res.json({ valid: true });
      } else {
        res.status(401).json({ message: "Invalid admin passcode" });
      }
    } catch (error) {
      res.status(500).json({ message: "Admin verification failed" });
    }
  });

  app.post("/api/admin/notify", async (req, res) => {
    try {
      const { orderId, message } = req.body;
      const notification = await storage.createNotification({ orderId, message });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Settings/Config
  app.get("/api/config", async (req, res) => {
    try {
      res.json({
        youtubeVideoUrl: process.env.YOUTUBE_VIDEO_URL || "",
        restaurantName: "Taste of π",
        location: "123 Italian Way, Little Italy, NY 10013",
        phone: "(555) 123-PIZZA",
        email: "info@tasteofpi.com"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch config" });
    }
  });

  // OTP/Phone verification (mock implementation)
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      // In a real implementation, you would send an actual OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      res.json({ success: true, message: "OTP sent successfully", otp }); // Remove otp in production
    } catch (error) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      // In a real implementation, you would verify the actual OTP
      if (otp.length === 6) {
        let user = await storage.getUserByEmail(phone); // Using email field for phone
        if (!user) {
          user = await storage.createUser({ name: `User ${phone}`, phone, email: phone });
        }
        res.json({ success: true, user });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
