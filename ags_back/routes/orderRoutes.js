// routes/orderRoutes.js
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

router.post("/", placeOrder);
router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.post("/:id/send-email", sendOrderEmail);
router.delete("/:id", deleteOrder);

export default router;