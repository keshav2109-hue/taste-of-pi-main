import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder,
  type Feedback, type InsertFeedback,
  type Coupon, type InsertCoupon,
  type Notification, type InsertNotification,
  type OrderItem
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;

  // Feedback
  getFeedback(): Promise<Feedback[]>;
  getOrderFeedback(orderId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  markCouponAsUsed(id: string): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private feedback: Map<string, Feedback> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const categories = [
      { id: "1", name: "Appetizers", description: "Start your meal with our delicious appetizers", image: "" },
      { id: "2", name: "Pasta", description: "Traditional Italian pasta dishes", image: "" },
      { id: "3", name: "Pizza", description: "Wood-fired pizzas with authentic flavors", image: "" },
      { id: "4", name: "Main Courses", description: "Hearty main dishes to satisfy your appetite", image: "" },
      { id: "5", name: "Desserts", description: "Sweet endings to your perfect meal", image: "" },
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Create default menu items
    const menuItems = [
      {
        id: "1",
        name: "Spaghetti Carbonara",
        description: "Classic Roman pasta with eggs, pecorino cheese, pancetta, and black pepper",
        price: "18.50",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: "2",
        ingredients: ["Spaghetti pasta", "eggs", "Pecorino Romano cheese", "Guanciale", "black pepper", "salt"],
        recipe: "Cook spaghetti al dente. In a separate pan, crisp the guanciale until golden. Beat eggs with cheese and pepper. Combine hot pasta with guanciale, then quickly mix with egg mixture off heat to create a creamy sauce.",
        isAvailable: true,
        allergens: ["eggs", "dairy", "gluten"]
      },
      {
        id: "2",
        name: "Margherita Pizza",
        description: "Traditional Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil",
        price: "16.00",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: "3",
        ingredients: ["Pizza dough", "San Marzano tomatoes", "fresh mozzarella", "fresh basil", "extra virgin olive oil", "sea salt"],
        recipe: "Stretch pizza dough by hand. Spread tomato sauce evenly. Add torn mozzarella pieces. Bake in wood-fired oven at 900°F for 90 seconds. Finish with fresh basil and olive oil.",
        isAvailable: true,
        allergens: ["gluten", "dairy"]
      },
      {
        id: "3",
        name: "Bruschetta al Pomodoro",
        description: "Toasted bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil",
        price: "12.00",
        image: "https://images.unsplash.com/photo-1572441713132-9b0d4b2c5ed9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: "1",
        ingredients: ["Ciabatta bread", "fresh tomatoes", "garlic", "fresh basil", "extra virgin olive oil", "balsamic vinegar"],
        recipe: "Toast bread slices until golden. Rub with garlic clove. Top with diced tomatoes mixed with basil, olive oil, and balsamic. Season with salt and pepper.",
        isAvailable: true,
        allergens: ["gluten"]
      },
      {
        id: "4",
        name: "Tiramisu",
        description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream",
        price: "9.50",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: "5",
        ingredients: ["Ladyfinger cookies", "mascarpone cheese", "eggs", "sugar", "espresso", "cocoa powder", "marsala wine"],
        recipe: "Dip ladyfingers in espresso and arrange in layers. Mix mascarpone with egg yolks and sugar. Whip egg whites and fold in. Layer with coffee-soaked cookies. Chill overnight and dust with cocoa.",
        isAvailable: true,
        allergens: ["eggs", "dairy", "gluten", "alcohol"]
      }
    ];

    menuItems.forEach(item => this.menuItems.set(item.id, item));

    // Create some default coupons
    for (let i = 1; i <= 100; i++) {
      const coupon = {
        id: randomUUID(),
        code: `TASTE${i.toString().padStart(3, '0')}`,
        isUsed: false,
        createdAt: new Date()
      };
      this.coupons.set(coupon.id, coupon);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      name: insertUser.name,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      googleId: insertUser.googleId ?? null,
      createdAt: new Date(),
      isAdmin: false 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      image: insertCategory.image ?? null
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Menu Item methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.isAvailable);
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      item => item.categoryId === categoryId && item.isAvailable
    );
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID(); const item: MenuItem = { 
      id,
      name: insertItem.name,
      description: insertItem.description,
      price: insertItem.price,
      image: insertItem.image,
      categoryId: insertItem.categoryId ?? null,
      ingredients: insertItem.ingredients ?? null,
      recipe: insertItem.recipe ?? null,
      isAvailable: insertItem.isAvailable ?? null,
      allergens: insertItem.allergens ?? null
    };
    this.menuItems.set(id, item);
    return item;
  }

  async updateMenuItem(id: string, updateData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updateData };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const billNumber = `BILL${Date.now()}`;
    const order: Order = { 
      ...insertOrder, 
       id,
      userId: insertOrder.userId ?? null,
      customerName: insertOrder.customerName,
      couponNumber: insertOrder.couponNumber ?? null,
      billNumber,
      items: insertOrder.items,
      totalAmount: insertOrder.totalAmount,
      paymentMethod: insertOrder.paymentMethod,
      paymentStatus: insertOrder.paymentStatus ?? null,
      specialInstructions: insertOrder.specialInstructions ?? null,
      status: insertOrder.status ?? null,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updateData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Feedback methods
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOrderFeedback(orderId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(fb => fb.orderId === orderId);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem: Feedback = { 
      id,
      orderId: insertFeedback.orderId ?? null,
      customerName: insertFeedback.customerName,
      rating: insertFeedback.rating,
      comment: insertFeedback.comment ?? null,
      createdAt: new Date() 
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  // Coupon methods
  async getCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(coupon => coupon.code === code);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = { 
       id,
      code: insertCoupon.code,
      isUsed: insertCoupon.isUsed ?? null,
      createdAt: new Date() 
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async markCouponAsUsed(id: string): Promise<boolean> {
    const coupon = this.coupons.get(id);
    if (!coupon) return false;
    
    coupon.isUsed = true;
    this.coupons.set(id, coupon);
    return true;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
    id,
      orderId: insertNotification.orderId ?? null,
      message: insertNotification.message,
      sentAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort((a, b) => 
      new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime()
    );
  }
}

export const storage = new MemStorage();
