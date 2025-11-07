import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react"; // 🗑️ import icon
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  const updateCart = (updated) => {
    setCartItems(updated);
    sessionStorage.setItem("cartItems", JSON.stringify(updated));
  };

  const updateQuantity = (id, change) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(updated);
  };

  // 🗑️ Remove item from cart
  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    updateCart(updated);
  };

  const getUnitPrice = (item) => item.price;

  const total = cartItems.reduce(
    (sum, item) => sum + getUnitPrice(item) * item.quantity,
    0
  );

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    wantsOffers: false,
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  const placeOrder = async () => {
    const payload = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || undefined,
      address: customer.address,
      wantsOffers: !!customer.wantsOffers,
      products: cartItems.map((ci) => ({
        productId: ci.id,
        productName: ci.productName,
        quantity: ci.quantity,
        price: ci.price,
        orderType: ci.orderType,
      })),
      totalPrice: Math.round(total),
      transactionId: `PH_${Date.now()}`,
    };

    setPlacingOrder(true);
    try {
      const res = await axiosInstance.post("/api/orders", payload, {
        method: "POST",
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200 || res.status === 201) {
        sessionStorage.removeItem("cartItems");
        setCartItems([]);
        await Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: "Your order has been placed successfully!",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to place order";
      await Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: errorMessage,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-10 px-5 md:px-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 text-sm md:text-base text-center py-16"
          >
            Your cart is empty <br />
            <span className="text-orange-500 font-semibold text-sm">
              Add something healthy to your basket!
            </span>
          </motion.p>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="py-3"
                  >
                    <div>
                      <div className="flex justify-between items-center text-gray-800 font-medium">
                        <span className="text-sm md:text-base">
                          {item.productName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.packName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 text-xs md:text-sm">
                        <p className="text-gray-500">
                          {item.orderType === "weeklySubscription"
                            ? "Weekly Plan"
                            : item.orderType === "monthlySubscription"
                            ? "Monthly Plan"
                            : "Single Order"}
                        </p>

                        {/* ✅ Quantity controls + Delete */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 font-semibold text-gray-800 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* 🗑️ Delete button */}
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <span className="font-bold text-gray-900 text-sm md:text-base w-20 text-right">
                          ₹{(getUnitPrice(item) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between text-gray-800">
              <h2 className="text-sm md:text-lg font-semibold">Total</h2>
              <span className="text-lg md:text-2xl font-bold text-orange-600">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Form Section (hidden initially, smooth reveal) */}
            <AnimatePresence>
              {showPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-700"
                >
                  <input
                    className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                    placeholder="Name"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                    placeholder="Phone (10 digits)"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                    placeholder="Email (optional)"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-300 rounded px-3 py-2 md:col-span-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                    placeholder="Delivery Address"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                  />
                  <label className="flex items-center gap-2 text-xs md:col-span-2 text-gray-600">
                    <input
                      type="checkbox"
                      checked={customer.wantsOffers}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          wantsOffers: e.target.checked,
                        })
                      }
                    />
                    I want to receive offer emails
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smooth Transition Button Section */}
            <div className="mt-8 text-center">
              {!showPayment ? (
                <motion.button
                  onClick={() => setShowPayment(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300"
                >
                  Place Order
                </motion.button>
              ) : (
                <motion.button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: placingOrder ? 1 : 1.05 }}
                  className={`bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300 ${
                    placingOrder ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {placingOrder ? "Placing Order..." : "Proceed to Pay"}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
