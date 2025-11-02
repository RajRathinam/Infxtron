import Product from "../models/Product.js";

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

    const imagePath = req.file?.path || null;

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

    if (req.file) product.imagePath = req.file.path;
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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};
