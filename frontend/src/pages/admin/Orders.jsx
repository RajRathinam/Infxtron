import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  User,
  MapPin,
  ShoppingBag,
  Phone,
  Mail,
  Trash2,
  CreditCard,
  Smartphone,
  Calendar,
  IndianRupee,
  Tag,
  FileText,
  Truck,
  Home,
  Building,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";

const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [deleting, setDeleting] = useState({});
  const [updatingPayment, setUpdatingPayment] = useState({});

  // WhatsApp number for payments
  const WHATSAPP_NUMBER = import.meta.env.VITE_BUSINESS_WHATSAPP_NUMBER || "919876543210";

  // Delivery points mapping
  const DELIVERY_POINTS = {
    point_a: { name: "Delivery Point A", icon: <Building size={14} /> },
    point_b: { name: "Delivery Point B", icon: <Building size={14} /> },
    point_c: { name: "Delivery Point C", icon: <Building size={14} /> },
    home_delivery: { name: "Home Delivery", icon: <Home size={14} /> }
  };

  // ✅ Load all orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load orders",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Update order status
  const updateStatus = async (id, status) => {
    setUpdatingStatus((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axiosInstance.patch(`/api/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: res.data.status || status } : order
        )
      );
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: "Order status updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ✅ Update payment status
  const updatePaymentStatus = async (id, paymentStatus) => {
    setUpdatingPayment((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axiosInstance.patch(`/api/orders/${id}/payment-status`, { paymentStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, paymentStatus: res.data.paymentStatus || paymentStatus } : order
        )
      );
      Swal.fire({
        icon: "success",
        title: "Payment Status Updated",
        text: `Payment status updated to ${paymentStatus}`,
      });
    } catch (err) {
      console.error("Failed to update payment status:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setUpdatingPayment((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ✅ Delete order
  const deleteOrder = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the order!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6dce00",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      await axiosInstance.delete(`/api/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order.id !== id));
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Order deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete order:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ✅ Open WhatsApp with payment request message
  const sendPaymentRequest = (order) => {
    const productDetails = order.products?.map(p => {
      const orderType = p.orderType || "singleOrder";
      const typeLabel = 
        orderType === "weeklySubscription" ? "Weekly Plan" :
        orderType === "monthlySubscription" ? "Monthly Plan" : "Single Order";
      
      return `• ${p.productName} (${typeLabel}) - Qty: ${p.quantity} - ₹${p.price}`;
    }).join('\n');

    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${order.Customer?.name},\n\nYour order from AG's Healthy Food is confirmed!\n\n📦 *Order Details:*\n${productDetails}\n\n💰 *Total Amount: ₹${order.totalPrice}*\n📍 *Delivery Address:* ${order.deliveryAddress}\n\n💳 *Payment Instructions:*\nPlease send payment of ₹${order.totalPrice} to ${WHATSAPP_NUMBER} and share the payment screenshot for confirmation.\n\nOnce we verify your payment, we'll process your order for delivery.`
    );

    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Open WhatsApp with payment confirmation message
  const sendPaymentConfirmation = (order) => {
    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${order.Customer?.name},\n\nThank you for your payment! Your payment of ₹${order.totalPrice} has been verified.\n\nYour order has been confirmed and will be delivered to:\n${order.deliveryAddress}\n\nWe'll notify you when your order is out for delivery. Thank you for choosing AG's Healthy Food! 🥗`
    );

    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Open WhatsApp with order taken message
  const sendOrderTakenMessage = (order) => {
    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${order.Customer?.name},\n\nYour order has been taken and we're preparing it for you! 🎉\n\nWe'll deliver it to:\n${order.deliveryAddress}\n\nThank you for choosing AG's Healthy Food!`
    );

    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Open WhatsApp with order shipped message
  const sendOrderShippedMessage = (order) => {
    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${order.Customer?.name},\n\nGreat news! Your order is out for delivery! 🚚\n\nIt should reach you shortly at:\n${order.deliveryAddress}\n\nThank you for choosing AG's Healthy Food!`
    );

    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Open WhatsApp with order delivered message
  const sendOrderDeliveredMessage = (order) => {
    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${order.Customer?.name},\n\nYour order has been successfully delivered! 🎊\n\nWe hope you enjoy your healthy meal from AG's Healthy Food!\n\nThank you for your order and we look forward to serving you again soon!`
    );

    window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Open WhatsApp with custom message
  const sendCustomMessage = (order) => {
    const whatsappNumber = order.Customer?.phone;
    
    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    Swal.fire({
      title: 'Send Custom WhatsApp Message',
      input: 'textarea',
      inputLabel: 'Enter your message',
      inputPlaceholder: 'Type your message here...',
      showCancelButton: true,
      confirmButtonText: 'Send via WhatsApp',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#25D366',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const message = encodeURIComponent(result.value);
        window.open(`https://wa.me/91${whatsappNumber}?text=${message}`, '_blank');
      }
    });
  };

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'initiated': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200'; // pending
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    return method === 'upi' ? <Smartphone size={14} /> : <CreditCard size={14} />;
  };

  // Get order status color
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'order delivered': return 'bg-green-600 text-white';
      case 'order shipped': return 'bg-blue-500 text-white';
      case 'order taken': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <p className="text-gray-500">Manage all customer orders.</p>
        </div>
        <div className="text-sm text-gray-600">
          Total Orders: <span className="font-bold text-green-600">{orders.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-500">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt);
            const date = orderDate.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const time = orderDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const deliveryPoint = DELIVERY_POINTS[order.deliveryPoint] || { 
              name: order.deliveryPoint, 
              icon: <MapPin size={14} /> 
            };

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-xl shadow-sm overflow-hidden border transition-all duration-300 ${
                  expandedOrder === order.id
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-white hover:shadow-md"
                }`}
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className={`p-4 cursor-pointer select-none transition-all duration-200 ${
                    expandedOrder === order.id ? "bg-green-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="text-green-600" size={22} />
                      <h2 className="font-semibold text-gray-800 text-base">
                        Order #{order.id}
                      </h2>
                    </div>
                    <p className="text-xs text-gray-500">
                      {date} • {time}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Order Status */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}
                      >
                        {order.status.replace('order ', '')}
                      </span>
                      
                      {/* Payment Status */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentMethodIcon(order.paymentMethod)}
                        {order.paymentMethod === 'upi' ? 'UPI' : 'WhatsApp'} • {order.paymentStatus}
                      </span>

                      {/* Delivery Point */}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        {deliveryPoint.icon}
                        {deliveryPoint.name}
                      </span>

                      {/* Delivery Charge */}
                      {order.deliveryCharge > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                          <Truck size={12} />
                          Delivery: ₹{order.deliveryCharge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendPaymentRequest(order);
                        }}
                        className="text-green-500 hover:text-green-600 transition p-1 rounded hover:bg-green-50"
                        title="Send WhatsApp payment request"
                      >
                        <MessageCircle size={18} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOrder(order.id);
                        }}
                        className="text-red-500 hover:text-red-600 transition p-1 rounded hover:bg-red-50"
                        disabled={deleting[order.id]}
                        title="Delete order"
                      >
                        {deleting[order.id] ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 space-y-4 border-t border-gray-300 bg-white"
                    >
                      {/* Order & Payment Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Order Information */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Order Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order ID:</span>
                              <span className="font-medium">#{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Placed On:</span>
                              <span className="font-medium">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="font-medium">{formatDate(order.updatedAt)}</span>
                            </div>
                            {order.transactionId && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-medium text-blue-600 text-xs">{order.transactionId}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <CreditCard size={18} className="text-green-600" />
                            Payment Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium flex items-center gap-1">
                                <MessageCircle size={14} className="text-green-600" />
                                WhatsApp Payment
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-bold text-green-600 flex items-center">
                                <IndianRupee size={14} />
                                {order.totalPrice}
                              </span>
                            </div>
                          </div>

                          {/* Payment Action Buttons */}
                          {order.paymentStatus === 'pending' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => updatePaymentStatus(order.id, 'completed')}
                                disabled={updatingPayment[order.id]}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingPayment[order.id] ? 'Updating...' : 'Mark Payment as Completed'}
                              </button>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Click after verifying payment screenshot
                              </p>
                            </div>
                          )}

                          {order.paymentStatus === 'completed' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => sendPaymentConfirmation(order)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <MessageCircle size={14} />
                                Send Payment Confirmation
                              </button>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Notify customer about payment verification
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Delivery Information */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Truck size={18} className="text-purple-600" />
                            Delivery Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Point:</span>
                              <span className="font-medium flex items-center gap-1">
                                {deliveryPoint.icon}
                                {deliveryPoint.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Charge:</span>
                              <span className={`font-medium flex items-center gap-1 ${
                                order.deliveryCharge > 0 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                <IndianRupee size={12} />
                                {order.deliveryCharge > 0 ? order.deliveryCharge : 'FREE'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium">
                                {order.deliveryPoint === 'home_delivery' ? 'Home Delivery' : 'Pickup Point'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <User className="text-green-600 mt-1" size={22} />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-base">
                              {order.Customer?.name || 'N/A'}
                            </p>
                            <div className="flex flex-col mt-1 text-sm text-green-700 space-y-1">
                              <a
                                href={`tel:${order.Customer?.phone}`}
                                className="flex items-center gap-1 hover:underline"
                              >
                                <Phone size={14} /> {order.Customer?.phone || 'N/A'}
                              </a>
                              {order.Customer?.email && (
                                <a
                                  href={`mailto:${order.Customer.email}`}
                                  className="flex items-center gap-1 hover:underline"
                                >
                                  <Mail size={14} /> {order.Customer.email}
                                </a>
                              )}
                              {order.Customer?.address && (
                                <div className="flex items-start gap-1 text-gray-600">
                                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                  <span>{order.Customer.address}</span>
                                </div>
                              )}
                              {order.Customer?.wantsOffers && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <Tag size={14} />
                                  <span>Wants to receive offers</span>
                                </div>
                              )}
                              {order.Customer?.message && (
                                <div className="flex items-start gap-1 text-blue-600">
                                  <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                  <span>Message: "{order.Customer.message}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Customer since: {formatDate(order.Customer?.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <MessageCircle size={14} className="text-green-600" />
                            <span>Pay to: {WHATSAPP_NUMBER}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="flex items-start gap-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <MapPin className="text-green-600 mt-1" size={20} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            Delivery Address
                          </h3>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              order.deliveryAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-700 hover:underline block mb-2"
                          >
                            {order.deliveryAddress}
                          </a>
                          <p className="text-xs text-gray-500">
                            Click address to open in Google Maps
                          </p>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 p-3 bg-green-100 border-b border-gray-300">
                          <ShoppingBag className="text-green-700" size={18} />
                          <h3 className="font-semibold text-green-700">
                            Ordered Products ({order.products?.length || 0})
                          </h3>
                        </div>
                        <div className="divide-y">
                          {order.products?.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col px-4 py-3 text-sm text-gray-700"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{p.productName}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    p.orderType === "weeklySubscription" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : p.orderType === "monthlySubscription"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {p.orderType === "weeklySubscription" 
                                      ? "Weekly Plan" 
                                      : p.orderType === "monthlySubscription"
                                      ? "Monthly Plan"
                                      : "Single Order"}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {p.packName && (
                                      <span>Pack: {p.packName}</span>
                                    )}
                                    <span>Qty: {p.quantity}</span>
                                    <span>Price: ₹{p.price}</span>
                                  </div>
                                  <span className="text-xs flex items-center my-auto font-semibold">
                                    Subtotal: <span className="text-green-700 ml-1">₹{p.price * p.quantity}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp Message Actions */}
                      <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MessageCircle size={18} className="text-green-600" />
                          WhatsApp Message Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <button
                            onClick={() => sendPaymentRequest(order)}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Payment Request
                          </button>
                          
                          <button
                            onClick={() => sendOrderTakenMessage(order)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Order Taken
                          </button>
                          
                          <button
                            onClick={() => sendOrderShippedMessage(order)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Order Shipped
                          </button>
                          
                          <button
                            onClick={() => sendOrderDeliveredMessage(order)}
                            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Order Delivered
                          </button>
                          
                          <button
                            onClick={() => sendPaymentConfirmation(order)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Payment Confirmed
                          </button>
                          
                          <button
                            onClick={() => sendCustomMessage(order)}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={14} />
                            Custom Message
                          </button>
                        </div>
                      </div>

                      {/* Status + Total */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">
                        <div className="flex flex-col text-sm text-gray-700">
                          <p className="font-semibold mb-2">Update Order Status:</p>
                          <div className="flex gap-4 flex-wrap">
                            {[
                              { label: "Taken", value: "order taken" },
                              { label: "Shipped", value: "order shipped" },
                              { label: "Delivered", value: "order delivered" },
                            ].map(({ label, value }) => (
                              <label
                                key={value}
                                className="flex items-center gap-1 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`status-${order.id}`}
                                  value={value}
                                  checked={order.status === value}
                                  disabled={updatingStatus[order.id]}
                                  onChange={(e) =>
                                    updateStatus(order.id, e.target.value)
                                  }
                                  className="accent-green-600"
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                            {updatingStatus[order.id] && (
                              <span className="text-gray-500 text-xs ml-2">
                                Updating...
                              </span>
                            )}
                          </div>

                          {/* Payment Status Update */}
                          <div className="mt-4">
                            <p className="font-semibold mb-2">Update Payment Status:</p>
                            <div className="flex gap-3 flex-wrap">
                              {[
                                { label: "Pending", value: "pending" },
                                { label: "Completed", value: "completed" },
                                { label: "Failed", value: "failed" },
                                { label: "Cancelled", value: "cancelled" },
                              ].map(({ label, value }) => (
                                <label
                                  key={value}
                                  className="flex items-center gap-1 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`payment-status-${order.id}`}
                                    value={value}
                                    checked={order.paymentStatus === value}
                                    disabled={updatingPayment[order.id]}
                                    onChange={(e) =>
                                      updatePaymentStatus(order.id, e.target.value)
                                    }
                                    className="accent-blue-600"
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                              {updatingPayment[order.id] && (
                                <span className="text-gray-500 text-xs ml-2">
                                  Updating...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-600 font-bold">Total Price:</p>
                            <p className="text-2xl font-semibold text-green-600 flex items-center">
                              <IndianRupee size={20} />
                              {order.totalPrice}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Includes all products {order.deliveryCharge > 0 && `+ ₹${order.deliveryCharge} delivery`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;