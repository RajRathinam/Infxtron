import express from "express";
import upload from "../config/multerConfig.js";
import {
  createOffer,
  listOffers,
  updateOfferStatus,
  deleteOffer,
} from "../controllers/offerController.js";

const router = express.Router();



// Admin-only routes
router.get("/", listOffers);
router.post("/", upload.single("image"), createOffer);
router.patch("/:id/status", updateOfferStatus);
router.delete("/:id", deleteOffer);

export default router;
