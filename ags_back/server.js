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

import { seedAdmin } from "./seeders/adminSeeder.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sequelize session store
const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
  db: sequelize,
  tableName: 'sessions', // Optional: custom table name
  checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
  expiration: 24 * 60 * 60 * 1000 // Session expiration: 24 hours
});

app.use(
  cors({
    origin: function (origin, callback) {
      // List of allowed origins
      const allowedOrigins = [
        "http://localhost:5173"
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
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
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

// Sync session store
store.sync();

app.get("/", (req, res) => res.send("✅ Server is running with MySQL + Sequelize"));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);


sequelize
  .authenticate()
  .then(() => console.log("✅ MySQL database connected successfully"))
  .catch((err) => console.error("❌ MySQL database connection failed:", err));

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ MySQL tables synced successfully");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  })
  .catch((err) => console.error("❌ Error syncing MySQL tables:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));