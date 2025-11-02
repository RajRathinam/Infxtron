import express from "express";
import { submitContact, getAllCustomers } from "../controllers/customerController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Submit contact form (public)
router.post("/contact", submitContact);

// Get all customers (admin only)
router.get("/", isAdmin, getAllCustomers);

export default router;


