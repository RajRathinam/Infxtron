import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from sessionStorage
  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("cartItems")) || [];
    setCartItems(stored);
  }, []);

  // Update sessionStorage when cart changes
  const updateCart = (updated) => {
    setCartItems(updated);
    sessionStorage.setItem("cartItems", JSON.stringify(updated));
  };

  // Quantity update function
  const updateQuantity = (name, change) => {
    const updated = cartItems.map((item) => {
      if (item.productName === name) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(updated);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.singleOrder * item.quantity,
    0
  );

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
            className="text-gray-600 text-md text-center py-16"
          >
            Your cart is empty <br />
            <span className="text-orange-500 font-semibold">
              Add something healthy to your basket!
            </span>
          </motion.p>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.productName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between py-4 text-sm md:text-base"
                  >
                    {/* Product Name */}
                    <div className="flex-1 text-gray-800 font-medium truncate pr-2">
                      {item.productName}
                      <p className="text-gray-500 text-xs md:text-sm">
                        ₹{item.singleOrder} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mx-4">
                      <button
                        onClick={() => updateQuantity(item.productName, -1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 font-medium text-gray-800 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productName, 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total for item */}
                    <span className="font-semibold text-gray-800 text-sm md:text-base w-20 text-right">
                      ₹{(item.singleOrder * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total Section */}
            <div className="mt-8 pt-4 flex items-center justify-between text-gray-800">
              <h2 className="text-lg md:text-xl font-semibold">Total</h2>
              <span className="text-xl md:text-2xl font-bold text-orange-600">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <div className="mt-6 text-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 text-sm md:text-lg rounded-lg font-semibold shadow-md transition-all duration-300 hover:scale-[1.03]">
                Proceed to Pay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
