import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
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

// 🔹 CORS Setup
app.use(
  cors({
    origin: "https://ags-ilws.onrender.com", // change to http://localhost:5173 if using Vite locally
    credentials: true,
  })
);

// 🔹 JSON Middleware
app.use(express.json());

// 🔹 Session Store Setup
const SequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new SequelizeStore({ db: sequelize });

// 🔹 Use Session Middleware
app.use(
  session({
    name: "ag_admin",
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // change to true if using HTTPS
      sameSite: "lax",
    },
  })
);

// 🔹 Sync the session table
sessionStore.sync();

// 🔹 Default Route
app.get("/", (req, res) => {
  res.send("% Server is running with PostgreSQL + Sequelize + Session Store");
});

// 🔹 API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);

// 🔹 Connect to Database
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// ⚠️ Optional: change { force: true } to { alter: true } to avoid dropping tables
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Tables synced successfully");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  })
  .catch((err) => console.error("❌ Error syncing tables:", err));

// 🔹 Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
