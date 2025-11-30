import Offer from "../models/Offer.js";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";

export const createOffer = async (req, res) => {
  try {
    const { title, description, startsAt, endsAt, isActive } = req.body;

    let imagePath = null;
    if (req.file && req.file.buffer) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { folder: "ag/offers" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        bufferStream.pipe(cloudStream);
      });
      imagePath = uploadResult.secure_url;
    }

    const offer = await Offer.create({
      title,
      description,
      imagePath,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ 
      message: "Offer created successfully", 
      offer 
    });
  } catch (error) {
    console.error("Create offer error:", error);
    res.status(500).json({ 
      message: "Failed to create offer", 
      error: error.message 
    });
  }
};

export const listOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({ 
      order: [["createdAt", "DESC"]] 
    });
    res.status(200).json(offers);
  } catch (error) {
    console.error("List offers error:", error);
    res.status(500).json({ 
      message: "Failed to fetch offers", 
      error: error.message 
    });
  }
};

export const getActiveOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const offers = await Offer.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          {
            startsAt: null,
            endsAt: null
          },
          {
            startsAt: { [Op.lte]: currentDate },
            endsAt: { [Op.gte]: currentDate }
          },
          {
            startsAt: { [Op.lte]: currentDate },
            endsAt: null
          },
          {
            startsAt: null,
            endsAt: { [Op.gte]: currentDate }
          }
        ]
      },
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json(offers);
  } catch (error) {
    console.error("Get active offers error:", error);
    res.status(500).json({ 
      message: "Failed to fetch active offers", 
      error: error.message 
    });
  }
};

export const updateOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ 
        message: "isActive field is required" 
      });
    }

    const offer = await Offer.findByPk(id);
    if (!offer) {
      return res.status(404).json({ 
        message: "Offer not found" 
      });
    }

    offer.isActive = Boolean(isActive);
    await offer.save();

    res.status(200).json({ 
      message: "Offer status updated successfully", 
      offer 
    });
  } catch (error) {
    console.error("Update offer status error:", error);
    res.status(500).json({ 
      message: "Failed to update offer status", 
      error: error.message 
    });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startsAt, endsAt, isActive } = req.body;

    const offer = await Offer.findByPk(id);
    if (!offer) {
      return res.status(404).json({ 
        message: "Offer not found" 
      });
    }

    let imagePath = offer.imagePath;
    if (req.file && req.file.buffer) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { folder: "ag/offers" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        bufferStream.pipe(cloudStream);
      });
      imagePath = uploadResult.secure_url;
    }

    // Update offer fields
    await offer.update({
      title: title || offer.title,
      description: description !== undefined ? description : offer.description,
      imagePath,
      startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : offer.startsAt,
      endsAt: endsAt !== undefined ? (endsAt ? new Date(endsAt) : null) : offer.endsAt,
      isActive: isActive !== undefined ? Boolean(isActive) : offer.isActive,
    });

    res.status(200).json({ 
      message: "Offer updated successfully", 
      offer 
    });
  } catch (error) {
    console.error("Update offer error:", error);
    res.status(500).json({ 
      message: "Failed to update offer", 
      error: error.message 
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findByPk(id);
    if (!offer) {
      return res.status(404).json({ 
        message: "Offer not found" 
      });
    }

    await offer.destroy();
    
    res.status(200).json({ 
      message: "Offer deleted successfully" 
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({ 
      message: "Failed to delete offer", 
      error: error.message 
    });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findByPk(id);
    if (!offer) {
      return res.status(404).json({ 
        message: "Offer not found" 
      });
    }

    res.status(200).json(offer);
  } catch (error) {
    console.error("Get offer by ID error:", error);
    res.status(500).json({ 
      message: "Failed to fetch offer", 
      error: error.message 
    });
  }
};