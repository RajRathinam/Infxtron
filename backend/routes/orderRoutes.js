import express from "express";
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  sendOrderEmail,
  updatePaymentStatus
} from "../controllers/orderController.js";

const router = express.Router();

// Place an order
router.post("/", placeOrder);

// Get all orders
router.get("/", getOrders);

// Update order status by ID
router.patch("/:id/status", updateOrderStatus);

// Update payment status by ID
router.patch("/:id/payment-status", updatePaymentStatus);

// Send order email separately
router.post("/:id/send-email", sendOrderEmail);

// Delete order by ID
router.delete("/:id", deleteOrder);

export default router;