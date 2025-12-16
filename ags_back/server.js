// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import sequelize from "./config/database.js";

import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dietPlanRoutes from "./routes/dietPlanRoutes.js"; // NEW

import { seedAdmin } from "./seeders/adminSeeder.js";
import telegramService from "./services/telegramService.js"; // NEW

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// In server.js, after telegramService.init():
telegramService.init().then(success => {
  if (success) {
    console.log('🤖 Telegram Bot: ✅ Connected and Ready');
  } else {
    console.log('🤖 Telegram Bot: ⚠️ Not configured (check .env file)');
    console.log('   Add to .env: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
  }
});
// Initialize Sequelize session store
const SessionStore = SequelizeStore(session.Store);
const store = new SessionStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,process.env.FRONTEND_URL_1
      ].filter(Boolean);
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    },
    name: "ag_admin",
    proxy: true
  })
);

// Debug middleware
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Sync session store
store.sync();

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ AG's Healthy Food Backend is running",
    services: {
      database: "MySQL + Sequelize",
      payments: "PhonePe Integration",
      notifications: "Telegram Bot",
      dietPlans: "Custom Diet Planning"
    },
    version: "1.0.0"
  });
});
// --- health check (keeps server awake) ---
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});
// API Status
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    status: "online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    telegram: telegramService.initialized ? "connected" : "disconnected"
  });
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/diet-plans", dietPlanRoutes); // NEW

// Database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ MySQL database connected successfully"))
  .catch((err) => {
    console.error("❌ MySQL database connection failed:", err);
    process.exit(1);
  });

// Sync database and start server
sequelize
  .sync({ 
    alter: false, // Change to false temporarily
    logging: console.log // Enable SQL logging
  })
  .then(async () => {
    console.log("✅ MySQL tables synced successfully");
    
    try {
      // Seed admin user
      await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    } catch (seedErr) {
      console.warn("⚠️  Admin seeding issue:", seedErr.message);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error syncing MySQL tables:", err);
  });
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;