import express from "express";
import upload from "../config/multerConfig.js";
import {
  createOffer,
  listOffers,
  updateOfferStatus,
  deleteOffer,getActiveOffers,updateOffer,getOfferById
} from "../controllers/offerController.js";

const router = express.Router();



// // Admin-only routes
// router.get("/", listOffers);
// router.post("/", upload.single("image"), createOffer);
// router.patch("/:id/status", updateOfferStatus);
// router.delete("/:id", deleteOffer);
// // In your routes file
// router.get('/active', getActiveOffers);
// router.get('/:id', getOfferById);
// router.put('/:id', updateOffer); // For full updates

export default router;
