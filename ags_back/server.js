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
import { seedAdmin } from "./seeders/adminSeeder.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sequelize session store
const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://agshealthyfoods.in"
      ];
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })
);

app.use(express.json());

// Session configuration - FIXED for production
app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // CHANGED: Always true in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'none', // CHANGED: Always none for cross-domain
    },
    name: "ag_admin",
    proxy: true
  })
);

// Session debugging middleware
app.use((req, res, next) => {
  console.log('=== SESSION DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  console.log('Origin:', req.headers.origin);
  console.log('=====================');
  next();
});

app.get("/", (req, res) => res.send("✅ Server is running with MySQL + Sequelize"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);

// Initialize database and start server - FIXED sequence
async function initializeApp() {
  try {
    // 1. Database connection
    await sequelize.authenticate();
    console.log("✅ MySQL database connected successfully");

    // 2. Sync session store first
    console.log("🔄 Creating sessions table...");
    await store.sync();
    console.log("✅ Sessions table created successfully");

    // 3. Sync other tables
    console.log("🔄 Syncing database tables...");
    await sequelize.sync({ alter: false }); // CHANGED: force false for production
    console.log("✅ MySQL tables synced successfully");

    // 4. Seed admin
    console.log("🔄 Seeding admin user...");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    console.log("✅ Admin user seeded successfully");

    // 5. Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
}

// Start the application
initializeApp();