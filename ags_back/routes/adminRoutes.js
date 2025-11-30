import express from "express";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { adminLogin, adminLogout, changePassword } from "../controllers/adminController.js";
import {isAdmin} from "../middleware/isAdmin.js";
const router = express.Router();

// --- Dashboard stats ---
router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalCustomers = await Customer.count();
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();

    res.json({
      totalCustomers,
      totalOrders,
      totalProducts,
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// --- Admin authentication routes ---
router.post("/login", adminLogin);
router.post("/logout",isAdmin, adminLogout);
router.put("/change-password",isAdmin, changePassword);

export default router;
