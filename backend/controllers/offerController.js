import Offer from "../models/Offer.js";
import Customer from "../models/Customer.js";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";
import { sendEmail } from "../utils/sendEmail.js";

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

    if (req.query.notify === "true") {
      const subs = await Customer.findAll({ where: { wantsOffers: true }, attributes: ["email", "name"] });
      const toList = subs.filter(s => !!s.email).map(s => s.email).join(",");
      if (toList) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>${title}</h2>
            ${imagePath ? `<img src="${imagePath}" alt="Offer" style="max-width:100%;border-radius:8px;"/>` : ""}
            <p>${description || ""}</p>
          </div>`;
        await sendEmail({ to: toList, subject: `New Offer: ${title}`, html });
      }
    }

    res.status(201).json({ message: "Offer created", offer });
  } catch (e) {
    res.status(500).json({ message: "Failed to create offer", error: e.message });
  }
};


export const listOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({ order: [["createdAt", "DESC"]] });
    res.json(offers);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch offers", error: e.message });
  }
};

export const updateOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    offer.isActive = !!isActive;
    await offer.save();
    res.json({ message: "Offer status updated", offer });
  } catch (e) {
    res.status(500).json({ message: "Failed to update offer", error: e.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    await offer.destroy();
    res.json({ message: "Offer deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete offer", error: e.message });
  }
};
