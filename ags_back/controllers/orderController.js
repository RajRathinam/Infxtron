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
  
  console.log("Updating order status:", { id, status }); // Debug log
  
  // Validate status
  const validStatuses = ["order taken", "order shipped", "order delivered"];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    // Find the order
    const order = await Order.findByPk(id, {
      include: [{ model: Customer }]
    });
    
    if (!order) {
      return res.status(404).json({ 
        message: "Order not found" 
      });
    }

    // Update status
    order.status = status;
    await order.save();

    console.log("Order updated successfully:", order.id); // Debug log
    
    // Get the updated order with customer info
    const updatedOrder = await Order.findByPk(id, {
      include: [{ model: Customer }]
    });

    res.status(200).json({ 
      success: true,
      message: `Order status updated to '${status}' successfully`, 
      order: updatedOrder
    });
    
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update order status", 
      error: err.message 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  
  console.log("Updating payment status:", { id, paymentStatus }); // Debug log

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: Customer }]
    });
    
    if (!order) {
      return res.status(404).json({ 
        message: "Order not found" 
      });
    }

    // Validate payment status if needed
    const validPaymentStatuses = ["pending", "completed", "failed"];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}`,
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    console.log("Payment status updated successfully:", order.id); // Debug log

    const updatedOrder = await Order.findByPk(id, {
      include: [{ model: Customer }]
    });

    res.status(200).json({ 
      success: true,
      message: `Payment status updated to '${paymentStatus}'`, 
      order: updatedOrder
    });
    
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ 
      success: false,
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id },
      include: [{
        model: Customer,
        attributes: ['name', 'phone', 'email', 'address']
      }]
    });

    if (!order) {
      return res.status(404).json({ 
        message: "Order not found" 
      });
    }

    // Format the response to match what we need for invoice
    const formattedOrder = {
      id: order.id,
      name: order.Customer?.name || '',
      phone: order.Customer?.phone || '',
      email: order.Customer?.email || '',
      address: order.deliveryAddress,
      products: order.products,
      totalPrice: order.totalPrice,
      deliveryCharge: order.deliveryCharge,
      deliveryPoint: order.deliveryPoint,
      deliveryDate: order.deliveryDate,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.status(200).json({
      message: "Order retrieved successfully",
      order: formattedOrder
    });

  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ 
      message: "Failed to fetch order", 
      error: err.message 
    });
  }
};