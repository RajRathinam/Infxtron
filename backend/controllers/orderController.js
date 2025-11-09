import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import { sendEmail } from "../utils/sendEmail.js";


// ✅ Get all orders with complete details
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: { 
        model: Customer, 
        attributes: ["id", "name", "phone", "email", "address", "wantsOffers", "message", "createdAt", "updatedAt"] 
      },
      attributes: ["id", "products", "totalPrice", "deliveryAddress", "status", "paymentMethod", "paymentStatus", "transactionId", "createdAt", "updatedAt", "customerId"]
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ✅ Update Order Status
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

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order status updated to '${status}' successfully`, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

// ✅ Delete Order
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


// Updated Place Order - No payment processing
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
    deliveryCharge
  } = req.body;

  // Validate required fields
  if (!name || !phone || !products || !totalPrice || !address || !deliveryPoint) {
    return res.status(400).json({ 
      message: "All required fields must be filled: name, phone, products, totalPrice, address, deliveryPoint" 
    });
  }

  if (wantsOffers && !email) {
    return res.status(400).json({ 
      message: "Email is required if customer wants offers details" 
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

  try {
    // Create customer
    const customer = await Customer.create({ 
      name, 
      phone, 
      email, 
      address, 
      wantsOffers 
    });

    // Create order - payment status starts as 'pending'
    const order = await Order.create({
      customerId: customer.id,
      products,
      totalPrice: Math.round(totalPrice),
      deliveryAddress: address,
      deliveryPoint,
      deliveryCharge: deliveryCharge || 0,
      paymentMethod: "whatsapp", // Changed to whatsapp
      paymentStatus: "pending", // Starts as pending
      transactionId: `ORD_${Date.now()}`,
    });

    // Return consistent response
    res.status(201).json({ 
      message: "Order placed successfully", 
      order: {
        id: order.id,
        customerId: order.customerId,
        products: order.products,
        totalPrice: order.totalPrice,
        deliveryAddress: order.deliveryAddress,
        deliveryPoint: order.deliveryPoint,
        deliveryCharge: order.deliveryCharge,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ 
      message: "Failed to place order", 
      error: err.message 
    });
  }
};

// In your orderController.js
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


export const sendOrderEmail = async (req, res) => {
  const { id } = req.params;

  // Validate order ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      message: "Invalid order ID",
      details: "Order ID must be a valid number" 
    });
  }

  try {
    console.log(`Attempting to send email for order ID: ${id}`);

    // Fetch order with customer info
    const order = await Order.findByPk(id, {
      include: { 
        model: Customer, 
        attributes: ["name", "phone", "email", "address", "wantsOffers"] 
      },
    });

    if (!order) {
      console.log(`Order not found with ID: ${id}`);
      return res.status(404).json({ 
        message: "Order not found",
        orderId: id 
      });
    }

    console.log(`Order found:`, {
      orderId: order.id,
      customerName: order.Customer.name,
      products: order.products
    });

    const { name, phone, email, address } = order.Customer;
    const products = order.products;
    const totalPrice = order.totalPrice;

    // Validate required fields
    if (!name || !phone || !address) {
      return res.status(400).json({
        message: "Missing customer information in order",
        missing: {
          name: !name,
          phone: !phone,
          address: !address
        }
      });
    }

    // Format products for email - INCLUDING ORDER TYPE
    const formattedProducts = Array.isArray(products)
      ? products.map(p => {
          const orderType = p.orderType || "singleOrder";
          const typeLabel = 
            orderType === "weeklySubscription" ? "Weekly Plan" :
            orderType === "monthlySubscription" ? "Monthly Plan" : "Single Order";
          
          return `• ${p.productName} (${typeLabel}) - Qty: ${p.quantity || 1} - ₹${p.price}`;
        }).join("<br/>")
      : String(products || "No products information");

    // Create WhatsApp messages - INCLUDING ORDER TYPE IN MESSAGE
    const productDetailsForWhatsApp = Array.isArray(products)
      ? products.map(p => {
          const orderType = p.orderType || "singleOrder";
          const typeLabel = 
            orderType === "weeklySubscription" ? "Weekly Plan" :
            orderType === "monthlySubscription" ? "Monthly Plan" : "Single Order";
          
          return `• ${p.productName} (${typeLabel}) - Qty: ${p.quantity || 1} - ₹${p.price}`;
        }).join('\n')
      : "No products information";

    const confirmMessage = encodeURIComponent(
      `Hello ${name},\n\nYour order has been confirmed by AG's Healthy Food!\n\nItems:\n${productDetailsForWhatsApp}\nTotal: ₹${totalPrice}`
    );

    const readyMessage = encodeURIComponent(
      `Hello ${name},\n\nWe are ready to deliver your order from AG's Healthy Food!\n\nItems:\n${productDetailsForWhatsApp}\nTotal: ₹${totalPrice}`
    );

    // HTML email template - ENHANCED WITH ORDER TYPE
    const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #f8f8f8; text-align: center; padding: 20px;">
    <img src="https://res.cloudinary.com/dximf5jvs/image/upload/v1761991343/uuqo1afuwr8cfkoes4hw.png" alt="AG's Healthy Food" style="width: 150px;" />
  </div>
  <div style="padding: 20px; background-color: #ffffff;">
    <h2 style="color: #b94d06ff;">New Order Placed!</h2>
    <p style="font-size: 16px; color: #333333;">You have received a new order from your customer. Details are below:</p>
    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; font-weight: bold; width: 120px;">Customer</td>
        <td style="padding: 8px;">${name}</td>
      </tr>
      <tr style="background-color: #f8f8f8;">
        <td style="padding: 8px; font-weight: bold;">Phone</td>
        <td style="padding: 8px;">
          <a href="tel:${phone}" style="color: #b94d06ff; text-decoration: none;">${phone}</a>
        </td>
      </tr>
      ${email ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Email</td>
        <td style="padding: 8px;">
          <a href="mailto:${email}" style="color: #b94d06ff; text-decoration: none;">${email}</a>
        </td>
      </tr>
      ` : ''}
      <tr style="background-color: #f8f8f8;">
        <td style="padding: 8px; font-weight: bold;">Address</td>
        <td style="padding: 8px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank" style="color: #b94d06ff; text-decoration: none;">
            ${address}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold; vertical-align: top;">Products</td>
        <td style="padding: 8px;">
          ${formattedProducts}
        </td>
      </tr>
      <tr style="background-color: #f8f8f8;">
        <td style="padding: 8px; font-weight: bold;">Total</td>
        <td style="padding: 8px; font-size: 18px; font-weight: bold;">₹${totalPrice}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Order Types</td>
        <td style="padding: 8px;">
          ${Array.isArray(products) ? products.map(p => {
            const orderType = p.orderType || "singleOrder";
            const typeLabel = 
              orderType === "weeklySubscription" ? "Weekly Plan" :
              orderType === "monthlySubscription" ? "Monthly Plan" : "Single Order";
            const badgeColor = 
              orderType === "weeklySubscription" ? "blue" :
              orderType === "monthlySubscription" ? "purple" : "gray";
            
            return `<span style="background-color: ${badgeColor === 'blue' ? '#dbeafe' : badgeColor === 'purple' ? '#f3e8ff' : '#f3f4f6'}; color: ${badgeColor === 'blue' ? '#1e40af' : badgeColor === 'purple' ? '#7e22ce' : '#374151'}; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; margin-bottom: 5px; display: inline-block;">
              ${p.productName}: ${typeLabel}
            </span>`;
          }).join('') : 'N/A'}
        </td>
      </tr>
    </table>

    <div style="text-align: center; display: flex; flex-direction: column; gap: 10px; margin-top: 30px;">
      <a href="https://wa.me/91${phone}?text=${confirmMessage}" target="_blank" 
         style="background-color: #FF9800; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: block;">
        Take Order 
      </a>
      <a href="https://wa.me/91${phone}?text=${readyMessage}" target="_blank" 
         style="background-color: #25D366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: block;">
        Ready To Deliver 
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #777777;">
      This is an automated notification from <strong>AG's Healthy Food</strong>.
    </p>
  </div>
</div>`;

    // Check if OWNER_EMAIL is configured
    if (!process.env.OWNER_EMAIL) {
      console.error("OWNER_EMAIL environment variable is not set");
      return res.status(500).json({ 
        message: "Email configuration error",
        details: "OWNER_EMAIL is not configured" 
      });
    }

    console.log(`Sending email to: ${process.env.OWNER_EMAIL}`);

    // Send email to owner
    await sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: `New Order Received from ${name}`,
      html: htmlContent,
    });

    console.log(`Order email sent successfully for order ${id}`);
    
    res.status(200).json({ 
      message: "Order email sent successfully",
      orderId: id,
      customerName: name
    });

  } catch (err) {
    console.error("Failed to send order email:", err);
    
    res.status(500).json({ 
      message: "Failed to send email", 
      error: err.message,
      orderId: id,
      details: "Check server logs for more information"
    });
  }
};