import express from "express";
import { getCustomers, createCustomer, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.delete("/:id", deleteCustomer); // <-- new route

export default router;
