// routes/paymentRoutes.js
import express from "express";
import { 
  initiatePayment, 
  paymentCallback, 
  getPaymentStatus,
  checkPhonePeConfig,
  updatePaymentStatus,  // For testing
  testPayment,          // For testing
  verifyPayment,
  testTelegram          // Add this import
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/config", checkPhonePeConfig);
router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);
router.get("/status/:transactionId", getPaymentStatus);
router.post("/update-status", updatePaymentStatus);  // Manual update for testing
router.post("/test", testPayment);    
router.post("/verify", verifyPayment);
router.post("/test-telegram", testTelegram);  // Add this new route

export default router;