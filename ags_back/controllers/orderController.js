import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  const { 
    name, 
    phone, 
    email, 
    address, 
    wantsOffers, 
    products, 
    totalPrice, 
    deliveryPoint,
    deliveryCharge,
    deliveryDate,
    paymentMethod = "cash_on_delivery" // Default to cash on delivery
  } = req.body;

  // Validate required fields
  if (!name || !phone || !products || !totalPrice || !address || !deliveryPoint || !deliveryDate) {
    return res.status(400).json({ 
      message: "All required fields must be filled: name, phone, products, totalPrice, address, deliveryPoint, deliveryDate" 
    });
  }

  // Validate delivery date
  const selectedDate = new Date(deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate <= today) {
    return res.status(400).json({ 
      message: "Delivery date must be from tomorrow onwards" 
    });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ 
      message: "Phone number must be exactly 10 digits" 
    });
  }

  // Validate delivery point
  const validDeliveryPoints = ["point_a", "point_b", "point_c", "home_delivery"];
  if (!validDeliveryPoints.includes(deliveryPoint)) {
    return res.status(400).json({ 
      message: `Invalid delivery point. Must be one of: ${validDeliveryPoints.join(", ")}` 
    });
  }

  // Validate payment method
  const validPaymentMethods = ["cash_on_delivery", "phonepay"]; // Removed whatsapp
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ 
      message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}` 
    });
  }

  try {
    // Create or find customer
    let customer = await Customer.findOne({ where: { phone } });
    if (!customer) {
      customer = await Customer.create({ 
        name, 
        phone, 
        email, 
        address, 
        wantsOffers 
      });
    } else {
      // Update customer details if they exist
      await customer.update({ name, email, address, wantsOffers });
    }

    // Generate transaction ID
    const transactionId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await Order.create({
      customerId: customer.id,
      products,
      totalPrice: Math.round(totalPrice),
      deliveryAddress: address,
      deliveryPoint,
      deliveryCharge: deliveryCharge || 0,
      deliveryDate: deliveryDate,
      paymentMethod: paymentMethod,
      paymentStatus: "pending", // Always pending for cash on delivery
      transactionId: transactionId,
      status: "order taken"
    });

    const response = {
      message: "Order placed successfully",
      order: {
        id: order.id,
        customerId: order.customerId,
        products: order.products,
        totalPrice: order.totalPrice,
        deliveryAddress: order.deliveryAddress,
        deliveryPoint: order.deliveryPoint,
        deliveryCharge: order.deliveryCharge,
        deliveryDate: order.deliveryDate,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    };

    res.status(201).json(response);

  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ 
      message: "Failed to place order", 
      error: err.message 
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: { 
        model: Customer, 
        attributes: ["id", "name", "phone", "email", "address", "wantsOffers"] 
      },
      order: [['createdAt', 'DESC']] // Newest first
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["order taken", "order shipped", "order delivered"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update status
    order.status = status;
    await order.save();

    res.status(200).json({ 
      message: `Order status updated to '${status}' successfully`, 
      order 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({ 
      message: `Payment status updated to '${paymentStatus}'`, 
      order 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to update payment status", 
      error: err.message 
    });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.destroy();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order", error: err.message });
  }
};