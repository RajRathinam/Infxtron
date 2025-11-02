import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import Swal from "sweetalert2";
import { ordersAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    wantsOffers: false,
  });
  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.address) {
      Swal.fire({
        title: "Missing Information!",
        text: "Please fill in all required fields (Name, Phone, Address).",
        icon: "warning",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      Swal.fire({
        title: "Invalid Phone!",
        text: "Phone number must be exactly 10 digits.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    if (formData.wantsOffers && !formData.email) {
      Swal.fire({
        title: "Email Required!",
        text: "Email is required if you want to receive offers.",
        icon: "warning",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        wantsOffers: formData.wantsOffers,
        products: cartItems.map((item) => ({
          productId: item.id || null,
          productName: item.productName,
          quantity: item.quantity,
          price: item.singleOrder,
        })),
        totalPrice: total,
      };

      const res = await ordersAPI.placeOrder(orderData);

      if (res.status === 201) {
        // Clear cart
        sessionStorage.removeItem("cartItems");
        window.dispatchEvent(new Event("cartUpdated"));
        
        Swal.fire({
          title: "Order Placed!",
          text: "Your order has been placed successfully. We'll contact you soon!",
          icon: "success",
          confirmButtonColor: "#6dce00",
        }).then(() => {
          navigate("/");
        });
      }
    } catch (error) {
      console.error("Order placement error:", error);
      Swal.fire({
        title: "Order Failed!",
        text: error.response?.data?.message || "Failed to place order. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    } finally {
      setLoading(false);
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
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 text-sm md:text-lg rounded-lg font-semibold shadow-md transition-all duration-300 hover:scale-[1.03]"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Form Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="10-digit phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {formData.wantsOffers && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={formData.wantsOffers}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="wantsOffers"
                    id="wantsOffers"
                    checked={formData.wantsOffers}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="wantsOffers" className="text-sm text-gray-700">
                    I want to receive offers and updates via email
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold shadow-md transition-all duration-300 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Placing Order..." : "Confirm Order"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
