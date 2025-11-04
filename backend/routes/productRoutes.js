import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../config/multerConfig.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Create product with image upload
router.post("/", isAdmin, upload.single("image"), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get slider products filtered by available day: /slider?day=Monday
router.get("/slider", async (req, res) => {
  try {
    let { day, timeSlot } = req.query;

    // Convert full date (2025-11-04) to weekday name (Tuesday)
    if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const date = new Date(day);
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      day = weekdays[date.getDay()];
    }

    const Product = (await import("../models/Product.js")).default;
    const all = await Product.findAll();

    let filtered = all;

    // Filter by available day
    if (day) {
      filtered = filtered.filter((p) =>
        (p.availableDay || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .includes(day.toLowerCase())
      );
    }

    // Filter by timeSlot if provided
    if (timeSlot) {
      filtered = filtered.filter((p) =>
        (p.availableTime || "")
          .toLowerCase()
          .includes(timeSlot.toLowerCase())
      );
    }

    res.json(filtered);
  } catch (e) {
    console.error("Slider error:", e);
    res.status(500).json({ message: "Failed to load slider products", error: e.message });
  }
});




// Get product by ID
router.get("/:id", getProductById);

// Update product
router.put("/:id", isAdmin, upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", isAdmin, deleteProduct);

export default router;
