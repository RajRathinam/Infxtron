import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

// Create product with image upload
router.post("/", upload.single("image"), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get product by ID
router.get("/:id", getProductById);

// Update product
router.put("/:id", upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

export default router;