import express from "express";
import { adminLogin, adminLogout, changePassword } from "../controllers/adminController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Login route
router.post("/login", adminLogin);

// Logout route (protected)
router.post("/logout", isAdmin, adminLogout);

// Change password (protected)
router.put("/change-password", isAdmin, changePassword);

export default router;
