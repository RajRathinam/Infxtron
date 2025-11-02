import Customer from "../models/Customer.js";

// Submit contact form (store in customer table)
export const submitContact = async (req, res) => {
  const { name, phone, email, message, wantsOffers } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
  }

  if (wantsOffers && !email) {
    return res.status(400).json({ message: "Email is required if customer wants offers" });
  }

  try {
    // Check if customer exists by phone
    let customer = await Customer.findOne({ where: { phone } });

    if (customer) {
      // Update existing customer
      customer.name = name;
      customer.email = email || customer.email;
      customer.message = message || customer.message;
      customer.wantsOffers = wantsOffers || false;
      if (req.body.address) customer.address = req.body.address;
      await customer.save();
    } else {
      // Create new customer
      customer = await Customer.create({
        name,
        phone,
        email: wantsOffers ? email : null,
        message: message || null,
        wantsOffers: wantsOffers || false,
      });
    }

    res.status(201).json({
      message: "Contact form submitted successfully",
      customer,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit contact form", error: err.message });
  }
};

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
};


