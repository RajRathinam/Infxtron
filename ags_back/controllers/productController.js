import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";

// Helper functions (keep existing ones)
const safeParseJSON = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

const safeStringify = (value) => {
  if (!value) return null;
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return null;
  }
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const pathWithVersion = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = pathWithVersion.split('.')[0];
    return publicId.replace(/^v\d+\//, '');
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      
      // Normal Pack
      normalWeight,
      normalProteinIntake,
      normalSingleOrder,
      normalWeeklySubscription,
      normalMonthlySubscription,
      
      // Meal Pack
      mealWeight,
      mealProteinIntake,
      mealSingleOrder,
      mealWeeklySubscription,
      mealMonthlySubscription,
      
      // Family Pack
      familyWeight,
      familyProteinIntake,
      familySingleOrder,
      familyWeeklySubscription,
      familyMonthlySubscription,
      
      availableDay,
      availableTime,
      ingredients,
      description,
    } = req.body;

    // Input validation for Normal Pack (required)
    if (!productName || !category || !normalWeight || !normalSingleOrder) {
      return res.status(400).json({ 
        message: "Product name, category, normal weight, and normal single order price are required" 
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
      category: category,
      
      // Normal Pack
      normalWeight: normalWeight.trim(),
      normalProteinIntake: normalProteinIntake ? normalProteinIntake.trim() : null,
      normalSingleOrder: parseInt(normalSingleOrder) || 0,
      normalWeeklySubscription: parseInt(normalWeeklySubscription) || 0,
      normalMonthlySubscription: parseInt(normalMonthlySubscription) || 0,
      
      // Meal Pack (optional)
      mealWeight: mealWeight ? mealWeight.trim() : null,
      mealProteinIntake: mealProteinIntake ? mealProteinIntake.trim() : null,
      mealSingleOrder: mealSingleOrder ? parseInt(mealSingleOrder) : null,
      mealWeeklySubscription: mealWeeklySubscription ? parseInt(mealWeeklySubscription) : null,
      mealMonthlySubscription: mealMonthlySubscription ? parseInt(mealMonthlySubscription) : null,
      
      // Family Pack (optional)
      familyWeight: familyWeight ? familyWeight.trim() : null,
      familyProteinIntake: familyProteinIntake ? familyProteinIntake.trim() : null,
      familySingleOrder: familySingleOrder ? parseInt(familySingleOrder) : null,
      familyWeeklySubscription: familyWeeklySubscription ? parseInt(familyWeeklySubscription) : null,
      familyMonthlySubscription: familyMonthlySubscription ? parseInt(familyMonthlySubscription) : null,
      
      availableDay: safeStringify(safeParseJSON(availableDay)),
      availableTime: availableTime ? availableTime.trim() : null,
      imagePath,
      ingredients: safeStringify(safeParseJSON(ingredients)),
      description: description ? description.trim() : null,
    });

    res.status(201).json({ 
      message: "Product created successfully", 
      product 
    });
  } catch (error) {
    console.error("Create product error:", error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
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
      order: [['createdAt', 'DESC']]
    });
    
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
      category,
      
      // Normal Pack
      normalWeight,
      normalProteinIntake,
      normalSingleOrder,
      normalWeeklySubscription,
      normalMonthlySubscription,
      
      // Meal Pack
      mealWeight,
      mealProteinIntake,
      mealSingleOrder,
      mealWeeklySubscription,
      mealMonthlySubscription,
      
      // Family Pack
      familyWeight,
      familyProteinIntake,
      familySingleOrder,
      familyWeeklySubscription,
      familyMonthlySubscription,
      
      availableDay,
      availableTime,
      ingredients,
      description,
    } = req.body;

    // Delete old image if new image uploaded
    if (req.file && req.file.buffer) {
      if (product.imagePath) {
        const oldPublicId = getPublicIdFromUrl(product.imagePath);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (cloudinaryError) {
            console.error('Error deleting old image:', cloudinaryError);
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

    // Update product fields
    const updateData = {};
    
    if (productName !== undefined) updateData.productName = productName.trim();
    if (category !== undefined) updateData.category = category;
    
    // Normal Pack
    if (normalWeight !== undefined) updateData.normalWeight = normalWeight.trim();
    if (normalProteinIntake !== undefined) updateData.normalProteinIntake = normalProteinIntake ? normalProteinIntake.trim() : null;
    if (normalSingleOrder !== undefined) updateData.normalSingleOrder = parseInt(normalSingleOrder) || 0;
    if (normalWeeklySubscription !== undefined) updateData.normalWeeklySubscription = parseInt(normalWeeklySubscription) || 0;
    if (normalMonthlySubscription !== undefined) updateData.normalMonthlySubscription = parseInt(normalMonthlySubscription) || 0;
    
    // Meal Pack
    if (mealWeight !== undefined) updateData.mealWeight = mealWeight ? mealWeight.trim() : null;
    if (mealProteinIntake !== undefined) updateData.mealProteinIntake = mealProteinIntake ? mealProteinIntake.trim() : null;
    if (mealSingleOrder !== undefined) updateData.mealSingleOrder = mealSingleOrder ? parseInt(mealSingleOrder) : null;
    if (mealWeeklySubscription !== undefined) updateData.mealWeeklySubscription = mealWeeklySubscription ? parseInt(mealWeeklySubscription) : null;
    if (mealMonthlySubscription !== undefined) updateData.mealMonthlySubscription = mealMonthlySubscription ? parseInt(mealMonthlySubscription) : null;
    
    // Family Pack
    if (familyWeight !== undefined) updateData.familyWeight = familyWeight ? familyWeight.trim() : null;
    if (familyProteinIntake !== undefined) updateData.familyProteinIntake = familyProteinIntake ? familyProteinIntake.trim() : null;
    if (familySingleOrder !== undefined) updateData.familySingleOrder = familySingleOrder ? parseInt(familySingleOrder) : null;
    if (familyWeeklySubscription !== undefined) updateData.familyWeeklySubscription = familyWeeklySubscription ? parseInt(familyWeeklySubscription) : null;
    if (familyMonthlySubscription !== undefined) updateData.familyMonthlySubscription = familyMonthlySubscription ? parseInt(familyMonthlySubscription) : null;
    
    if (availableDay !== undefined) updateData.availableDay = safeStringify(safeParseJSON(availableDay));
    if (availableTime !== undefined) updateData.availableTime = availableTime ? availableTime.trim() : null;
    if (ingredients !== undefined) updateData.ingredients = safeStringify(safeParseJSON(ingredients));
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    await product.update(updateData);

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

// Keep other functions (deleteProduct, getActiveProducts) as is
// ... (rest of the functions remain the same)

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