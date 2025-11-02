import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import { sendEmail } from "../utils/sendEmail.js";

export const placeOrder = async (req, res) => {
  const { name, phone, email, address, wantsOffers, products, totalPrice } = req.body;

  if (!name || !phone || !products || !totalPrice || !address) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  if (wantsOffers && !email) {
    return res.status(400).json({ message: "Email is required if customer wants offers details" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
  }

  try {
    let customer = await Customer.findOne({ where: { phone } });

    if (!customer) {
      customer = await Customer.create({ name, phone, email, address, wantsOffers });
    }

    const order = await Order.create({
      customerId: customer.id,
      products,
      totalPrice,
      deliveryAddress: address,
    });
    // Format products for email
    const formattedProducts = Array.isArray(products)
      ? products.map(p => `• ${p.productName} (${p.quantity || 1})`).join("<br/>")
      : products;

    const confirmMessage = encodeURIComponent(
      `Hello ${name},\n\n` +
      `Your order has been confirmed by AG's Healthy Food!\n\n` +
      `Order Details:\n` +
      `Customer Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Delivery Address: ${address}\n` +
      `Items: ${formattedProducts}\n` +
      `Total Price: ₹${totalPrice}\n\n` +
      `We are preparing your order and it will be ready for delivery soon. Thank you for choosing AG's Healthy Food!`
    );

    // WhatsApp message for Ready-to-Deliver
    const readyMessage = encodeURIComponent(
      `Hello ${name},\n\n` +
      `We are ready to deliver your order from AG's Healthy Food!\n\n` +
      `Order Details:\n` +
      `Customer Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Delivery Address: ${address}\n` +
      `Items: ${formattedProducts}\n` +
      `Total Price: ₹${totalPrice}\n\n` +
      `Thank you for choosing AG's Healthy Food!`
    );

    const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <!-- Logo -->
  <div style="background-color: #f8f8f8; text-align: center; padding: 20px;">
    <img src="https://res.cloudinary.com/dximf5jvs/image/upload/v1761991343/uuqo1afuwr8cfkoes4hw.png" alt="AG's Healthy Food" style="width: 150px;" />
  </div>

  <!-- Content -->
  <div style="padding: 20px; background-color: #ffffff;">
    <h2 style="color: #b94d06ff;">New Order Placed!</h2>
    <p style="font-size: 16px; color: #333333;">You have received a new order from your customer. Details are below:</p>

    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">Customer</td>
        <td style="padding: 8px;">${name}</td>
      </tr>
      <tr style="background-color: #f8f8f8;">
        <td style="padding: 8px; font-weight: bold;">Phone</td>
        <td style="padding: 8px;">
          <a href="tel:${phone}" style="color: #b94d06ff; text-decoration: none;">${phone}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Address</td>
        <td style="padding: 8px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank" style="color: #b94d06ff; text-decoration: none;">
            ${address}
          </a>
        </td>
      </tr>
      <tr style="background-color: #f8f8f8;">
        <td style="padding: 8px; font-weight: bold;">Products</td>
        <td style="padding: 8px;">${formattedProducts}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Total</td>
        <td style="padding: 8px;">₹${totalPrice}</td>
      </tr>
    </table>

    <!-- Buttons -->
    <div style="text-align: center; display: flex; flex-direction: column; gap: 10px; margin-top: 30px;">
      <!-- Confirm Order Button -->
      <a href="https://wa.me/${phone}?text=${confirmMessage}" target="_blank"
         style="background-color: #FF9800; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Take Order
      </a>

      <!-- Ready-to-Deliver WhatsApp Button -->
      <a href="https://wa.me/${phone}?text=${readyMessage}" target="_blank"
         style="background-color: #25D366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Ready To Deliver
      </a>
    </div>

<p style="margin-top: 30px; font-size: 14px; color: #777777;">
      This is an automated notification from <strong>AG's Healthy Food</strong>.
    </p>
  </div>
</div>
`;

    await sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: "New Order Received",
      html: htmlContent,
    });


    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};



// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: { model: Customer, attributes: ["name", "phone", "email"] },
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

  // Only allow 3 valid statuses
  const validStatuses = ["order taken", "order shipped", "order delivered"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status
    order.status = status;
    await order.save();

    res.status(200).json({
      message: `Order status updated to '${status}' successfully`,
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};
