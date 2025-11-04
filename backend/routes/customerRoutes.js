import express from "express";
import { getCustomers ,createCustomer} from "../controllers/customerController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getCustomers);
router.post("/", createCustomer);

export default router;


