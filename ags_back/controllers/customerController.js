import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['createdAt', 'DESC']], // Newest first
      attributes: { exclude: ['updatedAt'] } // Optional: exclude updatedAt if not needed
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ 
      message: "Failed to fetch customers", 
      error: error.message 
    });
  }
};

export const createCustomer = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const { name, phone, email, message, wantsOffers } = req.body;

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    if (wantsOffers && !email) {
      return res.status(400).json({ 
        message: "Email is required when opting in for offers" 
      });
    }

    // Check for duplicate phone number
    const existingCustomer = await Customer.findOne({ 
      where: { phone } 
    });

    if (existingCustomer) {
      return res.status(409).json({ 
        message: "Customer with this phone number already exists" 
      });
    }

    const newCustomer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: wantsOffers && email ? email.trim() : null,
      message: message ? message.trim() : null,
      wantsOffers: wantsOffers || false,
    });

    res.status(201).json({ 
      message: "Customer created successfully", 
      customer: newCustomer 
    });
  } catch (error) {
    console.error("Create customer error:", error);
    
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
        message: "Customer with this email or phone already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Valid customer ID is required" });
    }

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if this customer has any orders
    const orders = await Order.findAll({ 
      where: { customerId: id } 
    });

    if (orders.length > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing orders. Delete their orders first.",
        orderCount: orders.length
      });
    }

    await customer.destroy();
    res.status(200).json({ 
      message: "Customer deleted successfully" 
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};