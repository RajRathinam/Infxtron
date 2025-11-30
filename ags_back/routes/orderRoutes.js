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
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", placeOrder);
router.get("/",isAdmin, getOrders);
router.patch("/:id/status",isAdmin, updateOrderStatus);
router.patch("/:id/payment-status",isAdmin, updatePaymentStatus);
router.post("/:id/send-email",isAdmin, sendOrderEmail);
router.delete("/:id",isAdmin, deleteOrder);

export default router;