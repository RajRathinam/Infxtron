import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch customers", error: e.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const { name, phone, email, message, wantsOffers } = req.body;

    if (wantsOffers && !email) {
      return res.status(400).json({ message: "Email is required when opting in for offers." });
    }

    const newCustomer = await Customer.create({
      name,
      phone,
      email: wantsOffers ? email : null,
      message,
      wantsOffers,
    });

    res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
  } catch (e) {
    console.error("Create customer error:", e);
    res.status(500).json({
      message: "Failed to create customer",
      error: e.message,
    });
  }
};


export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if this customer has any orders
    const orders = await Order.findAll({ where: { customerId: id } });

    if (orders.length > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing orders. Delete their orders first.",
      });
    }

    await customer.destroy();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (e) {
    console.error("Delete customer error:", e);
    res.status(500).json({
      message: "Failed to delete customer",
      error: e.message,
    });
  }
};