import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
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

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://ags-ilws.onrender.com",
    credentials: true,
  })
);

app.use(express.json());


app.use(
  session({
    secret:
      process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true only in production with HTTPS
      httpOnly: true, // prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24, // 1 day session expiry
    },
    name: "ag_admin", // custom session name
  })
);

app.get("/", (req, res) => res.send("✅ Server is running with PostgreSQL + Sequelize"));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/payments", paymentRoutes);

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
