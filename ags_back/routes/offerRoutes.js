import express from "express";
import upload from "../config/multerConfig.js";
import {
  createOffer,
  listOffers,
  updateOfferStatus,
  deleteOffer,getActiveOffers,updateOffer,getOfferById
} from "../controllers/offerController.js";
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

// Admin-only routes
router.get("/",isAdmin, listOffers);
router.post("/",isAdmin, upload.single("image"), createOffer);
router.patch("/:id/status",isAdmin, updateOfferStatus);
router.delete("/:id",isAdmin, deleteOffer);
// In your routes file
router.get('/active', getActiveOffers);
router.get('/:id',isAdmin, getOfferById);
router.put('/:id',isAdmin, updateOffer); // For full updates

export default router;
