# Taste of π Restaurant Application

## Overview

Taste of π is a full-stack restaurant ordering application built with modern web technologies. The application features a React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and shadcn/ui components. It provides a complete restaurant experience including menu browsing, ordering, payment processing, feedback collection, and administrative management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) mode
- **Styling**: Tailwind CSS with shadcn/ui component library using the "new-york" style variant
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for authentication, cart, and theme management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured route handlers
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reloading with Vite middleware integration

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema covering users, categories, menu items, orders, feedback, coupons, and notifications
- **Migrations**: Drizzle Kit for database migrations and schema management

## Key Components

### Core Features
1. **Menu Management**: Categories and menu items with images, descriptions, pricing, and availability
2. **Shopping Cart**: Persistent cart with item customization and quantity management
3. **Order Processing**: Complete order workflow from cart to payment to receipt
4. **Payment System**: Support for cash and UPI payments with QR code generation
5. **Feedback System**: Customer feedback collection with ratings and comments
6. **Admin Dashboard**: Order management, feedback monitoring, and system configuration
7. **Authentication**: Simple phone-based authentication with OTP verification
8. **Progressive Web App**: PWA capabilities with service worker and manifest

### UI/UX Features
- **Theme System**: Light/dark/system theme support with persistent preferences
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Interactive Elements**: Accordions, dialogs, tooltips, carousels, and form components
- **Real-time Updates**: Live order status updates and notifications
- **Accessibility**: Screen reader support and keyboard navigation
- **Chatbot**: AI-powered customer support assistant

## Data Flow

### Order Processing Flow
1. Customer browses menu and adds items to cart
2. Customer proceeds to checkout and provides contact information
3. Order is created with unique bill number and customer details
4. Payment processing through cash or UPI methods
5. Order status updates from "received" → "preparing" → "ready" → "completed"
6. Receipt generation and optional feedback collection

### Authentication Flow
1. Customer enters phone number
2. OTP sent via SMS (simulated in development)
3. OTP verification creates or retrieves user account
4. Session stored in local storage with user context

### Data Persistence
- **Client-side**: Cart state, user authentication, theme preferences in localStorage
- **Server-side**: All business data in PostgreSQL with proper relational structure
- **Session Management**: Stateless authentication with client-side token storage

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-zod**: Database ORM and validation
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React routing
- **@radix-ui/***: Headless UI components foundation
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server
- **@replit/vite-plugin-***: Replit-specific development enhancements

### PWA Features
- **Service Worker**: Caching strategy for offline functionality
- **Web App Manifest**: PWA installation and branding
- **Responsive Images**: Optimized image loading with Unsplash integration

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with Express middleware integration
- **Type Checking**: TypeScript compilation with strict mode enabled
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Deployment**: Single Node.js process serving both API and static files

### Configuration Requirements
- PostgreSQL database with proper connection string
- Environment-specific configuration for payment processing
- SSL certificates for production HTTPS
- Domain configuration for PWA features

### Scaling Considerations
- Stateless architecture supports horizontal scaling
- Database connection pooling for concurrent requests
- CDN integration for static asset delivery
- Monitoring and logging for production operations
