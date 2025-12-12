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
  Clock,
  CheckCircle,
  ChevronDown,
  AlertCircle
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

  // Delivery points mapping
  const DELIVERY_POINTS = {
    point_a: { name: "Delivery Point A", icon: <Building size={14} /> },
    point_b: { name: "Delivery Point B", icon: <Building size={14} /> },
    point_c: { name: "Delivery Point B", icon: <Building size={14} /> },
    home_delivery: { name: "Home Delivery", icon: <Home size={14} /> }
  };

  // ✅ Parse products string to array
  const parseProducts = (products) => {
    if (!products) return [];

    try {
      // If it's already an array, return it
      if (Array.isArray(products)) {
        return products;
      }

      // If it's a string, try to parse it as JSON
      if (typeof products === 'string') {
        return JSON.parse(products);
      }

      return [];
    } catch (error) {
      console.error("Failed to parse products:", error, products);
      return [];
    }
  };

  // ✅ Load all orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/orders", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      // Parse products for each order
      const ordersArray = Array.isArray(res.data) ? res.data : [];
      const parsedOrders = ordersArray.map(order => ({
        ...order,
        products: parseProducts(order.products)
      }));

      setOrders(parsedOrders);
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

  // ✅ Update order status with improved error handling
  const updateStatus = async (id, status) => {
    setUpdatingStatus((prev) => ({ ...prev, [id]: true }));

    try {
      console.log(`Updating order ${id} to status: ${status}`);

      const res = await axiosInstance.patch(
        `/api/orders/${id}/status`,
        { status },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        }
      );

      console.log("Update response:", res.data);

      if (res.data.success) {
        // Update the specific order with the returned data
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? {
              ...order,
              ...res.data.order,
              status: status,
              products: parseProducts(res.data.order.products) // Parse products
            } : order
          )
        );

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.data.message || "Order status updated successfully",
          timer: 2000,
          showConfirmButton: false
        });

        // Refresh the list to ensure consistency
        setTimeout(() => {
          loadOrders();
        }, 1000);

      } else {
        throw new Error(res.data.message || "Update failed");
      }

    } catch (err) {
      console.error("❌ Update status error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });

      let errorMessage = "Failed to update order status";

      if (err.response) {
        errorMessage = err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;

        console.error("Server responded with:", err.response.data);

      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server. Please check your connection.";

      } else {
        console.error("Request setup error:", err.message);
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        html: `
          <div class="text-left">
            <p class="font-semibold mb-2">${errorMessage}</p>
            <p class="text-sm text-gray-600">Order ID: ${id}</p>
            <p class="text-sm text-gray-600">Status attempted: ${status}</p>
          </div>
        `,
      });

      // Refresh to get correct state
      loadOrders();
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ✅ Update payment status with improved error handling
  const updatePaymentStatus = async (id, paymentStatus) => {
    setUpdatingPayment((prev) => ({ ...prev, [id]: true }));

    try {
      console.log(`Updating payment status for order ${id} to: ${paymentStatus}`);

      const res = await axiosInstance.patch(
        `/api/orders/${id}/payment-status`,
        { paymentStatus },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        }
      );

      console.log("Payment update response:", res.data);

      if (res.data.success) {
        // Update the specific order with the returned data
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? {
              ...order,
              ...res.data.order,
              paymentStatus: paymentStatus,
              products: parseProducts(res.data.order.products) // Parse products
            } : order
          )
        );

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.data.message || "Payment status updated successfully",
          timer: 2000,
          showConfirmButton: false
        });

      } else {
        throw new Error(res.data.message || "Payment update failed");
      }

    } catch (err) {
      console.error("❌ Update payment status error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      let errorMessage = "Failed to update payment status";

      if (err.response) {
        errorMessage = err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        html: `
          <div class="text-left">
            <p class="font-semibold mb-2">${errorMessage}</p>
            <p class="text-sm text-gray-600">Order ID: ${id}</p>
            <p class="text-sm text-gray-600">Payment status attempted: ${paymentStatus}</p>
          </div>
        `,
      });

      // Refresh to get correct state
      loadOrders();
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
      await axiosInstance.delete(`/api/orders/${id}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
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

  // ✅ Check if payment status update should be shown
  const shouldShowPaymentStatusUpdate = (order) => {
    return order.paymentMethod === "cash_on_delivery";
  };

  // ✅ WhatsApp message sending functions
  const sendWhatsAppMessage = (order, messageType) => {
    const whatsappNumber = order.Customer?.phone;
    const deliveryDateFormatted = order.deliveryDate ? formatDeliveryDate(order.deliveryDate) : 'To be confirmed';

    if (!whatsappNumber) {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "Customer phone number not available",
      });
      return;
    }

    let message = '';

    switch (messageType) {
      case 'order_taken':
        message = `Hello ${order.Customer?.name || 'Customer'},\n\nYour order has been taken and we're preparing it for you! 🎉\n\nWe'll deliver it to:\n${order.deliveryAddress || 'Not specified'}\n📅 *Delivery Date:* ${deliveryDateFormatted}\n\nThank you for choosing AG's Healthy Food!`;
        break;
      case 'order_shipped':
        message = `Hello ${order.Customer?.name || 'Customer'},\n\nGreat news! Your order is out for delivery! 🚚\n\nIt should reach you shortly at:\n${order.deliveryAddress || 'Not specified'}\n📅 *Delivery Date:* ${deliveryDateFormatted}\n\nThank you for choosing AG's Healthy Food!`;
        break;
      case 'order_delivered':
        message = `Hello ${order.Customer?.name || 'Customer'},\n\nYour order has been successfully delivered! 🎊\n\nWe hope you enjoy your healthy meal from AG's Healthy Food!\n\nThank you for your order and we look forward to serving you again soon!`;
        break;
      default:
        return;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format delivery date function
  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Get delivery date status
  const getDeliveryDateStatus = (deliveryDate) => {
    if (!deliveryDate) return { status: 'not-set', color: 'bg-gray-100 text-gray-800', text: 'Not Set' };

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const delivery = new Date(deliveryDate);
      delivery.setHours(0, 0, 0, 0);

      const diffTime = delivery - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return { status: 'today', color: 'bg-red-100 text-red-800', text: 'Today' };
      if (diffDays === 1) return { status: 'tomorrow', color: 'bg-orange-100 text-orange-800', text: 'Tomorrow' };
      if (diffDays > 1 && diffDays <= 3) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', text: `${diffDays} days` };
      if (diffDays > 3) return { status: 'future', color: 'bg-green-100 text-green-800', text: `${diffDays} days` };
      if (diffDays < 0) return { status: 'past', color: 'bg-gray-100 text-gray-800', text: 'Past Date' };
    } catch {
      return { status: 'invalid', color: 'bg-gray-100 text-gray-800', text: 'Invalid Date' };
    }

    return { status: 'unknown', color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get payment method display
  const getPaymentMethodDisplay = (order) => {
    if (!order.paymentMethod) return {
      name: 'Unknown',
      icon: <CreditCard size={14} />,
      description: 'Unknown method',
      showPaymentUpdate: false
    };

    const method = order.paymentMethod.toLowerCase();

    if (method === "phonepay") {
      return {
        name: 'PhonePe',
        icon: <Smartphone size={14} />,
        description: 'Online Payment',
        showPaymentUpdate: false
      };
    } else if (method === "cash_on_delivery") {
      return {
        name: 'Cash on Delivery',
        icon: <CreditCard size={14} />,
        description: 'Pay when delivered',
        showPaymentUpdate: true
      };
    }

    return {
      name: 'Unknown',
      icon: <CreditCard size={14} />,
      description: 'Unknown method',
      showPaymentUpdate: false
    };
  };

  // Get order status color
  const getOrderStatusColor = (status) => {
    if (!status) return 'bg-gray-400 text-white';

    switch (status.toLowerCase()) {
      case 'order delivered': return 'bg-green-600 text-white';
      case 'order shipped': return 'bg-blue-500 text-white';
      case 'order taken': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  // Calculate total quantity of products
  const calculateTotalQuantity = (products) => {
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, product) => total + (product.quantity || 1), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <p className="text-gray-500">Manage all customer orders.</p>
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
            const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
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
              name: order.deliveryPoint || 'Unknown',
              icon: <MapPin size={14} />
            };

            const deliveryDateStatus = getDeliveryDateStatus(order.deliveryDate);
            const paymentMethod = getPaymentMethodDisplay(order);
            const totalQuantity = calculateTotalQuantity(order.products);
            const showPaymentUpdate = shouldShowPaymentStatusUpdate(order);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-xl shadow-sm overflow-hidden border transition-all duration-300 ${expandedOrder === order.id
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-white hover:shadow-md"
                  }`}
              >
                {/* Order Header - Mobile Optimized */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className={`p-3 cursor-pointer select-none transition-all duration-200 ${expandedOrder === order.id ? "bg-green-100" : "hover:bg-gray-50"
                    }`}
                >
                  {/* Top Row: Order Info */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <Package className="text-green-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h2 className="font-semibold text-gray-800 text-sm md:text-base">
                          Order #{order.id || 'N/A'}   <span className="text-xs ml-2 text-gray-500">
                            ({totalQuantity} items)
                          </span>
                        </h2>
                      </div>
                    </div>

                    {/* Delete Button - Always visible on mobile */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOrder(order.id);
                      }}
                      className="text-red-500 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 ml-2 flex-shrink-0"
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

                  {/* Status Badges Row */}
                  <div className="flex justify-between items-center gap-1 flex-wrap">
                    {/* Order Status */}
                    <span
                      className={`px-2 py-1.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)} whitespace-nowrap`}
                    >
                      {order.status?.replace('order ', '') || 'Unknown'}
                    </span>

                    {/* Payment Method */}
                    <span className="px-2 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1 whitespace-nowrap">
                      {paymentMethod.icon}
                      <span className="hidden xs:inline">{paymentMethod.name}</span>
                      <span className="xs:hidden">
                        {paymentMethod.name === 'PhonePe' ? 'Online' : 'COD'}
                      </span>
                    </span>

                    {/* Payment Status */}
                    <span className={`px-2 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)} whitespace-nowrap`}>
                      <span className="hidden sm:inline">{order.paymentStatus || 'pending'}</span>
                      <span className="sm:hidden">
                        {order.paymentStatus === 'completed' ? 'Paid' :
                          order.paymentStatus === 'pending' ? 'Pend' :
                            order.paymentStatus || 'Pend'}
                      </span>
                    </span>

                    {/* Delivery Date Status */}
                    {order.deliveryDate && (
                      <span className={`px-2 py-1.5 rounded-full text-xs font-medium ${deliveryDateStatus.color} flex items-center gap-1 whitespace-nowrap`}>
                        <Calendar size={10} className="flex-shrink-0" />
                        <span className="hidden md:inline">{deliveryDateStatus.text}</span>
                        <span className="md:hidden">
                          {deliveryDateStatus.status === 'today' ? 'Today' :
                            deliveryDateStatus.status === 'tomorrow' ? 'Tomorrow' :
                              deliveryDateStatus.text.includes('days') ? deliveryDateStatus.text.replace(' days', 'd') :
                                deliveryDateStatus.text}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-end mt-2 text-gray-500">
                    {date} • {time}
                  </p>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2 space-y-4 border-t border-gray-300 bg-white"
                    >
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
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Details */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Order Details
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
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="font-medium text-blue-600 text-xs">{order.transactionId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium flex items-center gap-1">
                                {paymentMethod.icon}
                                {paymentMethod.description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Truck size={18} className="text-purple-600" />
                            Delivery Details
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
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-purple-600 flex items-center gap-1">
                                <Calendar size={12} />
                                {order.deliveryDate ? formatDeliveryDate(order.deliveryDate) : 'Not set'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Charge:</span>
                              <span className={`font-medium flex items-center gap-1 ${order.deliveryCharge > 0 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                <IndianRupee size={12} />
                                {order.deliveryCharge > 0 ? order.deliveryCharge : 'FREE'}
                              </span>
                            </div>
                            {order.deliveryDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${deliveryDateStatus.color} px-2 py-1 rounded-full text-xs`}>
                                  {deliveryDateStatus.text}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Products Section - Mobile Optimized */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-100 border-b border-gray-300 gap-2">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="text-green-700 flex-shrink-0" size={18} />
                            <h3 className="font-semibold text-green-700 text-sm sm:text-base">
                              Ordered Products ({Array.isArray(order.products) ? order.products.length : 0})
                            </h3>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Total Items: {totalQuantity}
                          </div>
                        </div>

                        {/* Products List */}
                        <div className="divide-y max-h-64 overflow-y-auto">
                          {Array.isArray(order.products) && order.products.length > 0 ? (
                            order.products.map((p, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col p-3 sm:px-4 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {/* Product Name & Type */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                  <span className="font-medium text-sm sm:text-base">
                                    {p.productName || 'Unknown Product'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${p.orderType === "weeklySubscription"
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

                                {/* Product Details */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500">
                                    {p.packName && (
                                      <span className="px-2 py-1 bg-gray-100 rounded-md">
                                        Pack: {p.packName}
                                      </span>
                                    )}
                                    <span className="px-2 py-1 bg-blue-50 rounded-md">
                                      Qty: {p.quantity || 1}
                                    </span>
                                    <span className="px-2 py-1 bg-green-50 rounded-md flex items-center">
                                      <IndianRupee size={10} className="mr-1" />
                                      {p.price || 0}
                                    </span>
                                  </div>

                                  {/* Subtotal */}
                                  <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0">
                                    <span className="text-xs font-semibold text-gray-600 mr-2">
                                      Subtotal:
                                    </span>
                                    <span className="text-sm font-bold text-green-700 flex items-center">
                                      <IndianRupee size={12} className="mr-0.5" />
                                      {(p.price || 0) * (p.quantity || 1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-gray-500 text-center">
                              No products information available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Status Update - Always Visible */}
                        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-600" />
                            Update Order Status
                          </h3>
                          <div className="space-y-2">
                            {[
                              { label: "Taken", value: "order taken" },
                              { label: "Shipped", value: "order shipped" },
                              { label: "Delivered", value: "order delivered" },
                            ].map(({ label, value }) => (
                              <div key={value} className="flex items-center justify-between">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`status-${order.id}`}
                                    value={value}
                                    checked={order.status === value}
                                    disabled={updatingStatus[order.id]}
                                    onChange={() => updateStatus(order.id, value)}
                                    className="accent-green-600"
                                  />
                                  <span className="text-sm">{label}</span>
                                </label>
                                <button
                                  onClick={() => sendWhatsAppMessage(order, `order_${label.toLowerCase()}`)}
                                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                                  disabled={updatingStatus[order.id]}
                                >
                                  <MessageCircle size={12} />
                                  Notify
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Status Update - Conditional */}
                        {showPaymentUpdate ? (
                          <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <CreditCard size={18} className="text-blue-600" />
                              Update Payment Status (Cash on Delivery)
                            </h3>
                            <div className="space-y-2">
                              {[
                                { label: "Pending", value: "pending" },
                                { label: "Completed", value: "completed" },
                                { label: "Failed", value: "failed" },
                              ].map(({ label, value }) => (
                                <label key={value} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`payment-status-${order.id}`}
                                    value={value}
                                    checked={order.paymentStatus === value}
                                    disabled={updatingPayment[order.id]}
                                    onChange={() => updatePaymentStatus(order.id, value)}
                                    className="accent-blue-600"
                                  />
                                  <span className="text-sm">{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <CreditCard size={18} className="text-green-600" />
                              Payment Information
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium flex items-center gap-1">
                                  {paymentMethod.icon}
                                  {paymentMethod.name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)} px-2 py-1 rounded-full`}>
                                  {order.paymentStatus || 'pending'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle size={14} />
                                <span>Online payments are automatically processed</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Total Amount */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">
                        <div className="flex flex-col">
                          <p className="text-gray-600 font-bold">Total Amount:</p>
                          <p className="text-2xl font-semibold text-green-600 flex items-center">
                            <IndianRupee size={20} />
                            {order.totalPrice || 0}
                            {order.deliveryCharge > 0 && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Includes ₹{order.deliveryCharge} delivery)
                              </span>
                            )}
                          </p>
                          {order.deliveryDate && (
                            <div className="flex items-center gap-1 mt-2">
                              <Clock size={14} className="text-purple-600" />
                              <span className="text-sm text-purple-600 font-medium">
                                Delivery: {formatDeliveryDate(order.deliveryDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:items-end">
                          <div className="text-sm text-gray-600">
                            Payment: <span className="font-medium">{paymentMethod.name}</span>
                          </div>
                          {showPaymentUpdate && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Update payment status after delivery
                            </div>
                          )}
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