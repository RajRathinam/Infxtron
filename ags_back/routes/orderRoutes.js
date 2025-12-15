// routes/orderRoutes.js
import express from "express";
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,getOrderById
} from "../controllers/orderController.js";
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", placeOrder);
router.get("/",isAdmin, getOrders);
router.patch("/:id/status",isAdmin, updateOrderStatus);
router.patch("/:id/payment-status",isAdmin, updatePaymentStatus);
router.delete("/:id",isAdmin, deleteOrder);
// routes/orderRoutes.js
router.get("/:id", getOrderById); // Add this line
export default router;