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
router.post("/",isAdmin, upload.single("image"), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get product by ID
router.get("/:id", getProductById);

// Update product
router.put("/:id",isAdmin, upload.single("image"), updateProduct);

// Delete product
router.delete("/:id",isAdmin, deleteProduct);

export default router;