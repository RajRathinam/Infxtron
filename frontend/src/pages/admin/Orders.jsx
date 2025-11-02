import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  User,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";
import { ordersAPI } from "../../utils/api";
import Swal from "sweetalert2";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load orders. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      Swal.fire({
        title: "Updated!",
        text: `Order status updated to '${newStatus}'.`,
        icon: "success",
        confirmButtonColor: "#6dce00",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update order status.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    }
  };

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <p className="text-gray-500">View all customer orders with full details.</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : (
          orders.map((order) => {
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

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`border border-gray-100 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                  expandedOrder === order.id
                    ? "bg-gradient-to-b from-green-50 to-white"
                    : "bg-white"
                }`}
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className={`flex items-center justify-between p-4 cursor-pointer transition ${
                    expandedOrder === order.id ? "bg-green-100" : "hover:bg-green-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="text-[#6dce00]" size={22} />
                    <div>
                      <h2 className="font-semibold text-gray-800">Order #{order.id}</h2>
                      <p className="text-sm text-gray-500">
                        {date} • {time}
                      </p>
                    </div>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="text-gray-500" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={20} />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 border-t border-gray-100 space-y-4"
                  >
                    {/* Customer Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-4 border border-gray-300">
                      <div className="flex items-start gap-3">
                        <User className="text-[#6dce00] mt-1" size={22} />
                        <div>
                          <p className="font-semibold text-gray-800 text-base">
                            {order.Customer?.name || "N/A"}
                          </p>

                          {/* Contact Info */}
                          <div className="flex flex-col mt-1 text-sm text-[#b94d06]">
                            <a
                              href={`tel:${order.Customer?.phone || ""}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Phone size={14} /> {order.Customer?.phone || "N/A"}
                            </a>

                            {order.Customer?.email && (
                              <a
                                href={`mailto:${order.Customer.email}`}
                                className="flex items-center gap-1 hover:underline"
                              >
                                <Mail size={14} /> {order.Customer.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 sm:mt-0 text-sm text-gray-600">
                        <Clock className="text-[#6dce00]" size={18} />
                        <span>
                          Ordered on <strong>{date}</strong> at <strong>{time}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2 bg-white p-4 rounded-lg border border-gray-300">
                      <MapPin className="text-[#6dce00] mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            order.deliveryAddress
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#b94d06] hover:underline"
                        >
                          {order.deliveryAddress}
                        </a>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white rounded-lg border border-gray-300">
                      <div className="flex items-center gap-2 p-4 border-b border-gray-300 bg-green-100">
                        <ShoppingBag className="text-green-700" size={18} />
                        <h3 className="font-semibold text-green-700">Ordered Products</h3>
                      </div>
                      <div className="divide-y">
                        {Array.isArray(order.products) && order.products.length > 0 ? (
                          order.products.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between px-4 py-3 text-sm text-gray-700"
                            >
                              <span>{p.productName || "Product"}</span>
                              <span className="text-gray-600">
                                ₹{p.price || 0} × {p.quantity || 1} ={" "}
                                <span className="font-semibold text-green-700">
                                  ₹{(p.price || 0) * (p.quantity || 1)}
                                </span>
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">No products listed</div>
                        )}
                      </div>
                    </div>

                    {/* Total and Status Update */}
                    <div className="flex justify-between items-center">
                      <div className="text-right">
                        <p className="text-gray-600">Total Price</p>
                        <p className="text-xl font-semibold text-[#6dce00]">
                          ₹{order.totalPrice}
                        </p>
                      </div>
                      
                      {/* Status Update */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Order Status:
                        </label>
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6dce00] outline-none bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="order taken">Order Taken</option>
                          <option value="order shipped">Order Shipped</option>
                          <option value="order delivered">Order Delivered</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;