import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";

// Helper function to safely parse JSON (MySQL compatibility)
const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

// Helper function to stringify arrays/objects for MySQL TEXT fields
const safeStringify = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return null;
  }
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get the part after upload/ and remove file extension
    const pathWithVersion = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = pathWithVersion.split('.')[0];
    
    // Remove version number if present (v1234567890/)
    const finalPublicId = publicId.replace(/^v\d+\//, '');
    
    return finalPublicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
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

    // Input validation
    if (!productName || !packName || !weight || !singleOrder) {
      return res.status(400).json({ 
        message: "Product name, pack name, weight, and single order price are required" 
      });
    }

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
      productName: productName.trim(),
      packName: packName.trim(),
      weight: weight.trim(),
      proteinIntake: proteinIntake ? proteinIntake.trim() : null,
      availableDay: safeStringify(safeParseJSON(availableDay)), // Stringify for MySQL TEXT
      availableTime: availableTime ? availableTime.trim() : null,
      singleOrder: parseInt(singleOrder) || 0,
      weeklySubscription: parseInt(weeklySubscription) || 0,
      monthlySubscription: parseInt(monthlySubscription) || 0,
      imagePath,
      ingredients: safeStringify(safeParseJSON(ingredients)), // Stringify for MySQL TEXT
      discounts: safeParseJSON(discounts), // JSON field doesn't need stringification
      description: description ? description.trim() : null,
    });

    res.status(201).json({ 
      message: "Product created successfully", 
      product 
    });
  } catch (error) {
    console.error("Create product error:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: "Product with similar details already exists"
      });
    }

    res.status(500).json({ 
      message: "Failed to create product", 
      error: error.message 
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']] // Newest first
    });
    
    // Parse JSON fields for response (MySQL stores as strings)
    const formattedProducts = products.map(product => ({
      ...product.toJSON(),
      availableDay: safeParseJSON(product.availableDay) || [],
      ingredients: safeParseJSON(product.ingredients) || []
    }));
    
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ 
      message: "Failed to fetch products", 
      error: error.message 
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        message: "Valid product ID is required" 
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }

    // Parse JSON fields for response
    const formattedProduct = {
      ...product.toJSON(),
      availableDay: safeParseJSON(product.availableDay) || [],
      ingredients: safeParseJSON(product.ingredients) || []
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ 
      message: "Failed to fetch product", 
      error: error.message 
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        message: "Valid product ID is required" 
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }

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

    // Delete old image from Cloudinary if new image is uploaded
    if (req.file && req.file.buffer) {
      // Delete old image if exists
      if (product.imagePath) {
        const oldPublicId = getPublicIdFromUrl(product.imagePath);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (cloudinaryError) {
            console.error('Error deleting old image from Cloudinary:', cloudinaryError);
            // Continue with upload even if deletion fails
          }
        }
      }

      // Upload new image
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

    // Update product fields with proper data types for MySQL
    const updateData = {};
    
    if (productName !== undefined) updateData.productName = productName.trim();
    if (packName !== undefined) updateData.packName = packName.trim();
    if (weight !== undefined) updateData.weight = weight.trim();
    if (proteinIntake !== undefined) updateData.proteinIntake = proteinIntake ? proteinIntake.trim() : null;
    if (availableDay !== undefined) updateData.availableDay = safeStringify(safeParseJSON(availableDay));
    if (availableTime !== undefined) updateData.availableTime = availableTime ? availableTime.trim() : null;
    if (singleOrder !== undefined) updateData.singleOrder = parseInt(singleOrder) || 0;
    if (weeklySubscription !== undefined) updateData.weeklySubscription = parseInt(weeklySubscription) || 0;
    if (monthlySubscription !== undefined) updateData.monthlySubscription = parseInt(monthlySubscription) || 0;
    if (ingredients !== undefined) updateData.ingredients = safeStringify(safeParseJSON(ingredients));
    if (discounts !== undefined) updateData.discounts = safeParseJSON(discounts);
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    await product.update(updateData);

    // Get updated product with parsed JSON fields
    const updatedProduct = await Product.findByPk(id);
    const formattedProduct = {
      ...updatedProduct.toJSON(),
      availableDay: safeParseJSON(updatedProduct.availableDay) || [],
      ingredients: safeParseJSON(updatedProduct.ingredients) || []
    };

    res.status(200).json({ 
      message: "Product updated successfully", 
      product: formattedProduct 
    });
  } catch (error) {
    console.error("Update product error:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    res.status(500).json({ 
      message: "Failed to update product", 
      error: error.message 
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        message: "Valid product ID is required" 
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }

    // Delete image from Cloudinary if exists
    if (product.imagePath) {
      const publicId = getPublicIdFromUrl(product.imagePath);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
          // Continue with product deletion even if image deletion fails
        }
      }
    }

    // Delete product from database
    await product.destroy();

    res.status(200).json({ 
      message: "Product deleted successfully" 
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ 
      message: "Failed to delete product", 
      error: error.message 
    });
  }
};

// Additional utility function
export const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['productName', 'ASC']]
    });
    
    // Parse JSON fields for response
    const formattedProducts = products.map(product => ({
      ...product.toJSON(),
      availableDay: safeParseJSON(product.availableDay) || [],
      ingredients: safeParseJSON(product.ingredients) || []
    }));
    
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Get active products error:", error);
    res.status(500).json({ 
      message: "Failed to fetch active products", 
      error: error.message 
    });
  }
};