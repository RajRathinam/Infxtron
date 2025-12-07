// routes/transactionRoutes.js
import express from "express";
import { 
  getTransactions, 
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction 
} from "../controllers/transactionController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getTransactions);
router.get("/:id", isAdmin, getTransactionById);
router.patch("/:id/status", isAdmin, updateTransactionStatus);
router.delete("/:id", isAdmin, deleteTransaction);

export default router;