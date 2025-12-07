// routes/orderRoutes.js
import express from "express";
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,getOrderById
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", placeOrder);
router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.delete("/:id", deleteOrder);
// routes/orderRoutes.js
router.get("/:id", getOrderById); // Add this line
export default router;