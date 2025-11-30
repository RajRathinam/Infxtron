// routes/paymentRoutes.js
import express from "express";
import { 
  initiatePayment, 
  paymentCallback, 
  getPaymentStatus,
  checkPhonePeConfig 
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/config", checkPhonePeConfig);
router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);
router.get("/status/:transactionId", getPaymentStatus);

export default router;