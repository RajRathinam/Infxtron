import express from "express";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../config/multerConfig.js";
import {
  createOffer,
  listOffers,
  updateOfferStatus,
  deleteOffer,
} from "../controllers/offerController.js";

const router = express.Router();



// Admin-only routes
router.get("/", isAdmin, listOffers);
router.post("/", isAdmin, upload.single("image"), createOffer);
router.patch("/:id/status", isAdmin, updateOfferStatus);
router.delete("/:id", isAdmin, deleteOffer);

export default router;
