import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./config/database.js";

import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import { seedAdmin } from "./seeders/adminSeeder.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://ags-ilws.onrender.com", // change to 5173 if using Vite
    credentials: true,
  })
);

app.use(express.json());

// Serve static files (product images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    name: "ag_admin",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.get("/", (req, res) => res.send("✅ Server is running with PostgreSQL + Sequelize"));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Tables synced successfully");
    await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  })
  .catch((err) => console.error("❌ Error syncing tables:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
