import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Smartphone, CreditCard } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    wantsOffers: false,
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" or "upi"
  const [showUPIInstructions, setShowUPIInstructions] = useState(false);

  // Get UPI configuration from environment variables
  const UPI_CONFIG = {
    number: import.meta.env.VITE_BUSINESS_UPI_NUMBER,
    handler: import.meta.env.VITE_BUSINESS_UPI_HANDLER || 'paytm',
    name: import.meta.env.VITE_BUSINESS_NAME || "AG's Healthy Food"
  };

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

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    updateCart(updated);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const generateUPIPaymentLink = (amount) => {
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
    const upiId = `${UPI_CONFIG.number}@${UPI_CONFIG.handler}`;
    const encodedName = encodeURIComponent(UPI_CONFIG.name);
    const amountStr = total.toFixed(2);
    
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amountStr}&cu=INR`;
  };

  const handleUPIPayment = () => {
    // Validate UPI configuration
    if (!UPI_CONFIG.number) {
      Swal.fire({
        icon: "error",
        title: "Payment Configuration Error",
        text: "UPI payment is not configured. Please use cash on delivery.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const upiLink = generateUPIPaymentLink(total);
    window.open(upiLink, '_blank');
    
    // Show payment verification modal
    setShowUPIInstructions(true);
  };

  const updatePaymentStatus = async (orderId, status) => {
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/payment-status`, {
        paymentStatus: status
      });
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  const placeOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill name, phone, and address to place order.",
        confirmButtonColor: "#FF9800",
      });
      return;
    }

    // Validate UPI configuration if UPI payment is selected
    if (paymentMethod === "upi" && !UPI_CONFIG.number) {
      await Swal.fire({
        icon: "error",
        title: "Payment Not Available",
        text: "UPI payment is currently unavailable. Please use cash on delivery.",
        confirmButtonColor: "#dc2626",
      });
      setPaymentMethod("cash");
      return;
    }

    const payload = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || undefined,
      address: customer.address,
      wantsOffers: customer.wantsOffers,
      products: cartItems.map((ci) => ({
        productId: ci.id || ci._id,
        productName: ci.productName,
        quantity: ci.quantity,
        price: ci.price,
        orderType: ci.orderType,
        packName: ci.packName,
      })),
      totalPrice: Math.round(total),
      transactionId: `PH_${Date.now()}`,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "initiated",
    };

    setPlacingOrder(true);
    
    try {
      const orderRes = await axiosInstance.post("/api/orders", payload, {
        withCredentials: true,
      });

      if (!(orderRes.status === 200 || orderRes.status === 201)) {
        throw new Error("Order placement failed");
      }

      const orderId = orderRes.data.order.id;
      console.log("Order placed successfully, ID:", orderId, "Payload:", payload);

      if (paymentMethod === "upi") {
        // Open UPI payment
        handleUPIPayment();
        
        await Swal.fire({
          icon: "info",
          title: "Complete UPI Payment",
          html: `
            <div class="text-left">
              <p>✅ Order placed successfully!</p>
              <p class="mt-2">Please complete the UPI payment to confirm your order.</p>
              <p class="text-sm text-gray-600 mt-2">Order ID: <strong>${orderId}</strong></p>
              <p class="text-xs text-blue-600 mt-2">UPI ID: <strong>${UPI_CONFIG.number}@${UPI_CONFIG.handler}</strong></p>
            </div>
          `,
          confirmButtonText: "I've Paid",
          showCancelButton: true,
          cancelButtonText: "Cancel Order",
          confirmButtonColor: "#16a34a",
          cancelButtonColor: "#dc2626",
        }).then((result) => {
          if (result.isConfirmed) {
            // Mark as paid (manual verification)
            updatePaymentStatus(orderId, "completed");
            
            Swal.fire({
              icon: "success",
              title: "Payment Confirmed!",
              text: "Thank you for your payment. Your order is now confirmed.",
              confirmButtonColor: "#16a34a",
              timer: 3000,
            });
          } else {
            // Mark as cancelled
            updatePaymentStatus(orderId, "cancelled");
            
            Swal.fire({
              icon: "info",
              title: "Order Cancelled",
              text: "Your order has been cancelled.",
              confirmButtonColor: "#6b7280",
            });
          }
        });

      } else {
        // Cash on delivery - send email
        try {
          const emailResponse = await axiosInstance.post(
            `/api/orders/${orderId}/send-email`, 
            {},
            { withCredentials: true }
          );
          
          console.log("Email sent successfully:", emailResponse.data);
          
          await Swal.fire({
            icon: "success",
            title: "Order Placed Successfully!",
            text: "Your order has been placed successfully. Pay when delivered.",
            confirmButtonColor: "#25D366",
          });

        } catch (emailErr) {
          console.error("Email sending failed:", {
            status: emailErr.response?.status,
            data: emailErr.response?.data,
            message: emailErr.message
          });

          await Swal.fire({
            icon: "warning",
            title: "Order Placed!",
            html: `
              <div>
                <p>Your order has been placed successfully! 🎉</p>
                <p class="text-sm text-gray-600 mt-2">Pay when delivered.</p>
              </div>
            `,
            confirmButtonColor: "#FF9800",
          });
        }
      }

      // Clear cart regardless of email status
      sessionStorage.removeItem("cartItems");
      setCartItems([]);

    } catch (err) {
      console.error("Order placement failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      let errorMessage = "Failed to place order. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      await Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: errorMessage,
        confirmButtonColor: "#FF3B30",
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
                        <span className="text-sm md:text-base">{item.productName}</span>
                        <span className="text-xs text-gray-500">{item.packName}</span>
                      </div>

                      <div className="flex items-center justify-between py-3 text-xs md:text-sm">
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.orderType === "weeklySubscription" 
                              ? "bg-blue-100 text-blue-800" 
                              : item.orderType === "monthlySubscription"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {item.orderType === "weeklySubscription" 
                              ? "Weekly" 
                              : item.orderType === "monthlySubscription"
                              ? "Monthly"
                              : "Single"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center space-x-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 font-semibold text-gray-800 text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <span className="font-bold text-gray-900 text-sm md:text-base w-20 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between text-gray-800">
              <h2 className="text-sm md:text-lg font-semibold">Total</h2>
              <span className="text-lg md:text-2xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
            </div>

            <AnimatePresence>
              {showPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 space-y-4"
                >
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-700">
                    <input
                      className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                    <input
                      className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Phone (10 digits)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                    <input
                      className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Email (optional)"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                    <input
                      className="border border-gray-300 rounded px-3 py-2 md:col-span-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Delivery Address"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                    <label className="flex items-center gap-2 text-xs md:col-span-2 text-gray-600">
                      <input
                        type="checkbox"
                        checked={customer.wantsOffers}
                        onChange={(e) => setCustomer({ ...customer, wantsOffers: e.target.checked })}
                      />
                      I want to receive offer emails
                    </label>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        paymentMethod === "cash" 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-300 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <CreditCard className="mx-auto text-green-600 mb-1" size={20} />
                          <div className="text-xs font-medium mt-1">Cash on Delivery</div>
                          <div className="text-xs text-gray-500">Pay when delivered</div>
                        </div>
                      </label>

                      <label className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        paymentMethod === "upi" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-300 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === "upi"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Smartphone className="mx-auto text-blue-600 mb-1" size={20} />
                          <div className="text-xs font-medium mt-1">UPI Payment</div>
                          <div className="text-xs text-gray-500">Pay now with UPI</div>
                        </div>
                      </label>
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          {UPI_CONFIG.number ? (
                            <>💡 You'll be redirected to your UPI app to complete payment.</>
                          ) : (
                            <>⚠️ UPI payment is currently unavailable. Please use cash on delivery.</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  disabled={placingOrder || (paymentMethod === "upi" && !UPI_CONFIG.number)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: (placingOrder || (paymentMethod === "upi" && !UPI_CONFIG.number)) ? 1 : 1.05 }}
                  className={`px-8 py-2.5 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300 ${
                    placingOrder || (paymentMethod === "upi" && !UPI_CONFIG.number)
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : paymentMethod === "upi" 
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {placingOrder 
                    ? "Placing Order..." 
                    : paymentMethod === "upi" && !UPI_CONFIG.number
                      ? "UPI Unavailable"
                      : paymentMethod === "upi" 
                        ? "Pay with UPI" 
                        : "Place Order (Cash)"
                  }
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>

      {/* UPI Instructions Modal */}
      <AnimatePresence>
        {showUPIInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">UPI Payment Instructions</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p>Open your UPI app (PhonePe, Google Pay, Paytm, etc.)</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p>Send payment to: <strong className="text-green-600">{UPI_CONFIG.number}@{UPI_CONFIG.handler}</strong></p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p>Amount: <strong className="text-orange-600">₹{total.toFixed(2)}</strong></p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <p>Add note: <strong>Order #{Date.now()}</strong></p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowUPIInstructions(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUPIInstructions(false);
                    // Reopen UPI link
                    const upiLink = generateUPIPaymentLink(total);
                    window.open(upiLink, '_blank');
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Open UPI App
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}