import express from "express";
import { getCustomers, createCustomer, deleteCustomer } from "../controllers/customerController.js";
import {isAdmin} from "../middleware/isAdmin.js";
const router = express.Router();

router.get("/",isAdmin, getCustomers);
router.post("/", createCustomer);
router.delete("/:id",isAdmin, deleteCustomer); // <-- new route

export default router;
