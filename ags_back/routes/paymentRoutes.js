// routes/paymentRoutes.js
import express from "express";
import { 
  initiatePayment, 
  paymentCallback, 
  getPaymentStatus,
  checkPhonePeConfig,
  testWebhook  // Add this
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/config", checkPhonePeConfig);
router.get("/test-webhook", testWebhook);  // For debugging
router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);
router.get("/status/:transactionId", getPaymentStatus);

export default router;