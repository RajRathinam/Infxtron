import express from "express";
import { placeOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

// Place an order
router.post("/", placeOrder);

// Get all orders
router.get("/", getOrders);

// ✅ Update order status by ID
router.patch("/:id/status", updateOrderStatus);

export default router;
