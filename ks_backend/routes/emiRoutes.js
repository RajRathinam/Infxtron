// routes/emiRoutes.js - Customer EMI Routes
import express from 'express';
import {
  calculateEMIOptions,
  getMyEMIPayments,
  getEMIPaymentDetails,
  getUpcomingInstallments,
  getOverdueInstallments
} from '../controllers/emiController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and customer role
router.use(authenticate);
router.use(requireCustomer);

// Calculate EMI options
router.post('/calculate', calculateEMIOptions);

// Get user's EMI payments
router.get('/my-payments', getMyEMIPayments);

// Get upcoming installments
router.get('/upcoming', getUpcomingInstallments);

// Get overdue installments
router.get('/overdue', getOverdueInstallments);

// Get single EMI payment details
router.get('/:id', getEMIPaymentDetails);

export default router;



