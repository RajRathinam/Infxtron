import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";

const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      packName,
      weight,
      proteinIntake,
      availableDay,
      availableTime,
      singleOrder,
      weeklySubscription,
      monthlySubscription,
      ingredients,
      discounts,
      description,
    } = req.body;

    let imagePath = null;
    if (req.file && req.file.buffer) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { folder: "ag/products" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        bufferStream.pipe(cloudStream);
      });
      imagePath = uploadResult.secure_url;
    }

    const product = await Product.create({
      productName,
      packName,
      weight,
      proteinIntake,
      availableDay,
      availableTime,
      singleOrder: parseInt(singleOrder),
      weeklySubscription: parseInt(weeklySubscription),
      monthlySubscription: parseInt(monthlySubscription),
      imagePath,
      ingredients: safeParseJSON(ingredients),
      discounts: safeParseJSON(discounts),
      description,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      productName,
      packName,
      weight,
      proteinIntake,
      availableDay,
      availableTime,
      singleOrder,
      weeklySubscription,
      monthlySubscription,
      ingredients,
      discounts,
      description,
    } = req.body;

    if (req.file && req.file.buffer) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { folder: "ag/products" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        bufferStream.pipe(cloudStream);
      });
      product.imagePath = uploadResult.secure_url;
    }
    if (productName) product.productName = productName;
    if (packName) product.packName = packName;
    if (weight) product.weight = weight;
    if (proteinIntake) product.proteinIntake = proteinIntake;
    if (availableDay) product.availableDay = availableDay;
    if (availableTime) product.availableTime = availableTime;
    if (singleOrder) product.singleOrder = parseInt(singleOrder);
    if (weeklySubscription) product.weeklySubscription = parseInt(weeklySubscription);
    if (monthlySubscription) product.monthlySubscription = parseInt(monthlySubscription);
    if (ingredients) product.ingredients = safeParseJSON(ingredients);
    if (discounts) product.discounts = safeParseJSON(discounts);
    if (description) product.description = description;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/")[1]; // get everything after 'upload/'
  if (!parts) return null;
  const publicIdWithExt = parts.split(".")[0]; // remove file extension
  return publicIdWithExt;
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary if exists
    if (product.imagePath) {
      const publicId = getPublicIdFromUrl(product.imagePath);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete product from database
    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};