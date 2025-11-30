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
  checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
  expiration: 24 * 60 * 60 * 1000 // Session expiration: 24 hours
});

app.use(
  cors({
    origin: function (origin, callback) {
      // List of allowed origins
      const allowedOrigins = [
        "https://aghealthyfood-vz17.onrender.com",
        "https://agshealthyfoods.in"
      ];
      
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })
);

app.use(express.json());

// Session configuration with Sequelize store
app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set to true in production if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // Important for cross-site
    },
    name: "ag_admin",
    proxy: true // Trust the reverse proxy if you're behind one (like Render)
  })
);

// Add this after session middleware in server.js
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  next();
});

app.get("/", (req, res) => res.send("✅ Server is running with MySQL + Sequelize"));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);

// Initialize database and start server
async function initializeApp() {
  try {
    // 1. First authenticate database connection
    await sequelize.authenticate();
    console.log("✅ MySQL database connected successfully");

    // 2. Sync session store FIRST before syncing other tables
    console.log("🔄 Creating sessions table...");
    await store.sync();
    console.log("✅ Sessions table created successfully");

    // 3. Sync all other database tables (remove force: true in production)
    console.log("🔄 Syncing database tables...");
    await sequelize.sync({ force: false }); // Change to { force: false } for production
    console.log("✅ MySQL tables synced successfully");

    // 4. Seed admin user
    console.log("🔄 Seeding admin user...");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    console.log("✅ Admin user seeded successfully");

    // 5. Start the server only after everything is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
}

// Start the application
initializeApp();