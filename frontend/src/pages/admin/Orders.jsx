import React, { useEffect, useState } from "react";
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, { credentials: "include" });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    await loadOrders();
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
                          {order.Customer.name}
                        </p>

                        {/* Contact Info */}
                        <div className="flex flex-col mt-1 text-sm text-[#b94d06]">
                          <a
                            href={`tel:${order.Customer.phone}`}
                            className="flex items-center gap-1 hover:underline"
                          >
                            <Phone size={14} /> {order.Customer.phone}
                          </a>

                          {order.Customer.email && (
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
                      {order.transactionId && (
                        <span className="ml-3">Txn: <strong>{order.transactionId}</strong></span>
                      )}
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
                      {order.products.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between px-4 py-3 text-sm text-gray-700"
                        >
                          <span>{p.productName}</span>
                          <span className="text-gray-600">
                            ₹{p.price} × {p.quantity} ={" "}
                            <span className="font-semibold text-green-700">
                              ₹{p.price * p.quantity}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      <label className="mr-2">Update Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="order taken">order taken</option>
                        <option value="order shipped">order shipped</option>
                        <option value="order delivered">order delivered</option>
                      </select>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Total Price</p>
                      <p className="text-xl font-semibold text-[#6dce00]">
                        ₹{order.totalPrice}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
