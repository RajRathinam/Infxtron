import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, MapPin } from "lucide-react";
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
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Delivery points configuration
  const DELIVERY_POINTS = [
    { id: "point_a", name: "Delivery Point A", address: "123 Main Street, City Center", freeDelivery: true },
    { id: "point_b", name: "Delivery Point B", address: "456 Market Road, Downtown", freeDelivery: true },
    { id: "point_c", name: "Delivery Point C", address: "789 Park Avenue, Uptown", freeDelivery: true },
    { id: "home_delivery", name: "Home Delivery", address: "Deliver to my address", freeDelivery: false, charge: 10 }
  ];

  // Get UPI configuration from environment variables
  const UPI_CONFIG = {
    number: import.meta.env.VITE_BUSINESS_UPI_NUMBER, // Format: xxxxx@okicici
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

  const productTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = productTotal + deliveryCharge;

  const generateUPIPaymentLink = () => {
    const amountStr = total.toFixed(2);
    const encodedName = encodeURIComponent(UPI_CONFIG.name);
    const note = `Order_${Date.now()}`;
    
    // Format for UPI: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
    return `upi://pay?pa=${UPI_CONFIG.number}&pn=${encodedName}&am=${amountStr}&cu=INR&tn=${note}`;
  };

  const initiateUPIPayment = () => {
    if (!UPI_CONFIG.number) {
      Swal.fire({
        icon: "error",
        title: "UPI Not Configured",
        text: "UPI payment is not available. Please contact support.",
        confirmButtonColor: "#dc2626",
      });
      return false;
    }

    try {
      const upiLink = generateUPIPaymentLink();
      console.log("Opening UPI Link:", upiLink);
      
      // Try to open UPI app directly (works with Google Pay, PhonePe, Paytm, BHIM, etc.)
      window.location.href = upiLink;
      
      return true;
    } catch (error) {
      console.error("Error opening UPI:", error);
      
      // Fallback: Show UPI ID for manual payment
      Swal.fire({
        icon: "info",
        title: "Manual UPI Payment",
        html: `
          <div class="text-left">
            <p class="text-sm">Please open your UPI app and send payment to:</p>
            <p class="text-lg font-bold text-green-600 mt-2">${UPI_CONFIG.number}</p>
            <div class="mt-3 space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Amount:</span>
                <span class="font-bold">₹${total.toFixed(2)}</span>
              </div>
              <div class="flex justify-between">
                <span>Name:</span>
                <span>${UPI_CONFIG.name}</span>
              </div>
            </div>
          </div>
        `,
        confirmButtonText: "I've Paid",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#dc2626",
      });
      
      return true;
    }
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

  const handleDeliveryPointChange = (pointId) => {
    setSelectedDeliveryPoint(pointId);
    const point = DELIVERY_POINTS.find(p => p.id === pointId);
    setDeliveryCharge(point?.freeDelivery ? 0 : (point?.charge || 0));
  };

  const placeOrder = async () => {
    // Validate required fields
    if (!customer.name || !customer.phone || !selectedDeliveryPoint) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill name, phone, and select delivery point to place order.",
        confirmButtonColor: "#FF9800",
      });
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(customer.phone)) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Phone",
        text: "Please enter a valid 10-digit phone number.",
        confirmButtonColor: "#FF9800",
      });
      return;
    }

    // Validate home delivery address
    if (selectedDeliveryPoint === 'home_delivery' && !customer.address.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Address Required",
        text: "Please enter your delivery address for home delivery.",
        confirmButtonColor: "#FF9800",
      });
      return;
    }

    // Validate UPI configuration
    if (!UPI_CONFIG.number) {
      await Swal.fire({
        icon: "error",
        title: "Payment Unavailable",
        text: "Payment is currently unavailable. Please contact support.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const selectedPoint = DELIVERY_POINTS.find(p => p.id === selectedDeliveryPoint);
    const finalAddress = selectedPoint.id === 'home_delivery' 
      ? customer.address 
      : `${selectedPoint.name}, ${selectedPoint.address}`;

    const payload = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || undefined,
      address: finalAddress,
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
      deliveryPoint: selectedDeliveryPoint,
      deliveryCharge: deliveryCharge,
      transactionId: `TXN_${Date.now()}`,
      paymentMethod: "upi",
      paymentStatus: "initiated",
    };

    setPlacingOrder(true);
    
    try {
      // First, place the order
      const orderRes = await axiosInstance.post("/api/orders", payload, {
        withCredentials: true,
      });

      if (!(orderRes.status === 200 || orderRes.status === 201)) {
        throw new Error("Order placement failed");
      }

      const orderId = orderRes.data.order?.id || orderRes.data.id;
      console.log("Order placed successfully, ID:", orderId);

      // Show payment confirmation
      const paymentConfirmed = await Swal.fire({
        icon: "info",
        title: "Proceed to Payment",
        html: `
          <div class="text-left">
            <p class="font-semibold">Order Summary:</p>
            <div class="mt-2 space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Products:</span>
                <span>₹${productTotal.toFixed(2)}</span>
              </div>
              ${deliveryCharge > 0 ? `
                <div class="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>₹${deliveryCharge.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="flex justify-between border-t border-gray-300 pt-1 font-bold">
                <span>Total Amount:</span>
                <span class="text-orange-600">₹${total.toFixed(2)}</span>
              </div>
            </div>
            <p class="mt-3 text-sm">Click "Pay Now" to complete payment via UPI.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Pay Now",
        cancelButtonText: "Cancel Order",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#dc2626",
      });

      if (paymentConfirmed.isConfirmed) {
        // Initiate UPI payment
        const paymentInitiated = initiateUPIPayment();
        
        if (!paymentInitiated) {
          await Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: "Could not process payment. Please try again.",
            confirmButtonColor: "#dc2626",
          });
          return;
        }

        // Wait a moment for UPI app to open, then ask for confirmation
        setTimeout(async () => {
          const paymentResult = await Swal.fire({
            icon: "question",
            title: "Payment Confirmation",
            html: `
              <div class="text-left">
                <p class="text-sm">Did you complete the payment of <strong>₹${total.toFixed(2)}</strong>?</p>
                <div class="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <p><strong>UPI ID:</strong> ${UPI_CONFIG.number}</p>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">Please check your UPI app for payment confirmation.</p>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Yes, Payment Done",
            cancelButtonText: "Payment Failed",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#dc2626",
            allowOutsideClick: false,
          });

          if (paymentResult.isConfirmed) {
            // Mark payment as completed
            await updatePaymentStatus(orderId, "completed");
            
            await Swal.fire({
              icon: "success",
              title: "Order Confirmed! 🎉",
              html: `
                <div class="text-left">
                  <p>Thank you for your payment!</p>
                  <p class="text-sm text-gray-600 mt-2">Your order has been confirmed and will be delivered soon.</p>
                  <div class="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p class="text-xs font-semibold text-green-800">Order Details:</p>
                    <p class="text-xs mt-1"><strong>Order ID:</strong> ${orderId}</p>
                    <p class="text-xs"><strong>Delivery:</strong> ${selectedPoint.name}</p>
                    <p class="text-xs"><strong>Total Paid:</strong> ₹${total.toFixed(2)}</p>
                  </div>
                </div>
              `,
              confirmButtonColor: "#16a34a",
              timer: 8000,
            });

            // Clear cart and reset form
            sessionStorage.removeItem("cartItems");
            setCartItems([]);
            setShowPayment(false);
            setCustomer({
              name: "",
              phone: "",
              email: "",
              address: "",
              wantsOffers: false,
            });
            setSelectedDeliveryPoint("");
            setDeliveryCharge(0);

          } else {
            // Mark payment as failed
            await updatePaymentStatus(orderId, "failed");
            
            await Swal.fire({
              icon: "info",
              title: "Payment Not Completed",
              html: `
                <div class="text-left">
                  <p>Your order is placed but payment is pending.</p>
                  <p class="text-sm text-gray-600 mt-2">Please complete the payment to confirm your order.</p>
                  <p class="text-xs text-gray-500 mt-2">Order ID: <strong>${orderId}</strong></p>
                </div>
              `,
              confirmButtonColor: "#6b7280",
            });
          }
        }, 2000);

      } else {
        // Cancel order
        await updatePaymentStatus(orderId, "cancelled");
        await Swal.fire({
          icon: "info",
          title: "Order Cancelled",
          text: "Your order has been cancelled.",
          confirmButtonColor: "#6b7280",
        });
      }

    } catch (err) {
      console.error("Order placement failed:", err);

      let errorMessage = "Failed to place order. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
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

            {/* Order Summary */}
            <div className="mt-6 space-y-2 border-t border-gray-300 pt-4">
              <div className="flex justify-between text-sm">
                <span>Products Total:</span>
                <span>₹{productTotal.toFixed(2)}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹{total.toFixed(2)}</span>
              </div>
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
                      placeholder="Full Name *"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Phone Number (10 digits) *"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
                      placeholder="Email (optional)"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
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

                  {/* Delivery Points Selection */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      Select Delivery Point *
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {DELIVERY_POINTS.map((point) => (
                        <label
                          key={point.id}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            selectedDeliveryPoint === point.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryPoint"
                            value={point.id}
                            checked={selectedDeliveryPoint === point.id}
                            onChange={(e) => handleDeliveryPointChange(e.target.value)}
                            className="hidden"
                          />
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{point.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{point.address}</div>
                            </div>
                            <div className="text-right">
                              {point.freeDelivery ? (
                                <span className="text-green-600 text-xs font-bold">FREE</span>
                              ) : (
                                <span className="text-orange-600 text-xs font-bold">₹{point.charge}</span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Home Delivery Address (if selected) */}
                    {selectedDeliveryPoint === 'home_delivery' && (
                      <div className="mt-3">
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 text-sm"
                          placeholder="Enter your complete delivery address with landmark *"
                          rows={3}
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Information */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Payment Method</h3>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        Payment will be processed via UPI. You'll be redirected to your UPI app (Google Pay, PhonePe, Paytm, etc.) to complete the payment.
                      </p>
                      {UPI_CONFIG.number && (
                        <p className="text-xs text-gray-600 mt-1">
                          UPI ID: <strong>{UPI_CONFIG.number}</strong>
                        </p>
                      )}
                    </div>
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
                  Proceed to Payment
                </motion.button>
              ) : (
                <motion.button
                  onClick={placeOrder}
                  disabled={placingOrder || !UPI_CONFIG.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: placingOrder ? 1 : 1.05 }}
                  className={`px-8 py-2.5 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300 ${
                    placingOrder || !UPI_CONFIG.number
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {placingOrder 
                    ? "Processing..." 
                    : !UPI_CONFIG.number
                      ? "Payment Unavailable"
                      : `Pay ₹${total.toFixed(2)} via UPI`
                  }
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}