// routes/adminEmiRoutes.js - Admin EMI Routes
import express from 'express';
import {
  getAllEMIPayments,
  getEMIPaymentDetailsAdmin,
  getPendingInstallments,
  getOverdueInstallmentsAdmin,
  markInstallmentPaid,
  sendInstallmentReminder,
  getEMIStats
} from '../controllers/adminEmiController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get EMI statistics
router.get('/stats', getEMIStats);

// Get all EMI payments
router.get('/payments', getAllEMIPayments);

// Get pending installments
router.get('/installments/pending', getPendingInstallments);

// Get overdue installments
router.get('/installments/overdue', getOverdueInstallmentsAdmin);

// Get single EMI payment details
router.get('/payments/:id', getEMIPaymentDetailsAdmin);

// Mark installment as paid
router.put('/installments/:id/mark-paid', markInstallmentPaid);

// Send reminder for installment
router.post('/installments/:id/send-reminder', sendInstallmentReminder);

export default router;



