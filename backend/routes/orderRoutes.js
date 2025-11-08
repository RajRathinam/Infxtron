import express from "express";
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  sendOrderEmail,updatePaymentStatus
} from "../controllers/orderController.js";

const router = express.Router();

// Place an order (no email sending here)
router.post("/", placeOrder);

// Get all orders
router.get("/", getOrders);

// ✅ Update order status by ID
router.patch("/:id/status", updateOrderStatus);

// ✅ Delete order by ID
router.delete("/:id", deleteOrder);

// ✅ Send order email separately
router.post("/:id/send-email", sendOrderEmail);

// In your orderRoutes.js
router.patch("/:id/payment-status", updatePaymentStatus);

export default router;



// Customer places order with UPI payment option

// System generates UPI link with your business number

// Customer makes payment in their UPI app

// You receive payment notification in your UPI app

// You manually verify payment in your admin panel

// Update order status to "payment confirmed"