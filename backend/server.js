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

// 🧠 Detect environment
const isProduction = process.env.NODE_ENV === "production";

// 🔹 CORS Setup (Allow both local and production frontend)
app.use(
  cors({
    origin: [
      "https://ags-ilws.onrender.com", // frontend (Render)
      "http://localhost:5173",         // local dev
    ],
    credentials: true,
  })
);

app.use(express.json());

// 🔹 Sequelize Session Store Setup
const SequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new SequelizeStore({ db: sequelize });

// 🔹 Session Middleware
app.use(
  session({
    name: "ag_admin",
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: isProduction, // true only in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // allow cross-site cookies in production
      httpOnly: true, // prevent client-side JavaScript access
      path: "/", // cookie available for all paths
    },
  })
);

// Sync session table
sessionStore.sync();

// 🔹 Default Route
app.get("/", (req, res) =>
  res.send("✅ Server is running with PostgreSQL + Sequelize + Render config")
);

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

// Sync models (without dropping)
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Tables synced successfully");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  })
  .catch((err) => console.error("❌ Error syncing tables:", err));

// 🔹 Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
