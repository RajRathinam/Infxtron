// routes/dietPlanRoutes.js
import express from 'express';
import {
  createDietPlan,
  getAllDietPlans,
  getDietPlanById,
  updateDietPlan,
  deleteDietPlan, // Add this import
  resendDietPlanNotification,
  getDietPlanStats,
  testDietPlanTelegram
} from '../controllers/dietPlanController.js';
import { isAdmin } from '../middleware/isAdmin.js';
const router = express.Router();

// Public routes
router.post('/', createDietPlan);

// Protected/admin routes
router.get('/', isAdmin, getAllDietPlans);
router.get('/stats', isAdmin, getDietPlanStats);
router.get('/:id', isAdmin, getDietPlanById);
router.put('/:id', isAdmin, updateDietPlan);
router.delete('/:id', isAdmin, deleteDietPlan); // Add this line
router.post('/:id/resend-notification', isAdmin, resendDietPlanNotification); // Add isAdmin middleware
router.post('/test-telegram', isAdmin, testDietPlanTelegram);

export default router;