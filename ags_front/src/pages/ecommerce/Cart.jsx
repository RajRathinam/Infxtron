import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, MapPin, Calendar, CreditCard, Clock, Package, CheckCircle, Loader } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Invoice generation function WITHOUT jsPDF-autotable
const generateInvoice = (orderDetails) => {
  try {
    // Import jsPDF dynamically to avoid build issues
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      // Add logo if available
      try {
        const logoUrl = '/AGHealthyFood.png';
        const img = new Image();
        img.src = logoUrl;
        
        img.onload = function() {
          // Draw logo
          doc.addImage(img, 'PNG', 20, 10, 30, 30);
          drawInvoiceContent(65);
        };
        
        img.onerror = function() {
          // Continue without logo
          drawInvoiceContent(20);
        };
      } catch (logoErr) {
        // Continue without logo
        drawInvoiceContent(20);
      }
      
      function drawInvoiceContent(startY) {
        let yPos = startY;
        
        // Header with orange color
        doc.setFontSize(22);
        doc.setTextColor(255, 102, 0); // Orange color
        doc.setFont(undefined, 'bold');
        doc.text("AG's Healthy Food", 105, yPos, { align: 'center' });
        
        yPos += 8;
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0); // Green for subtitle
        doc.text("Healthy & Fresh Food Delivery", 105, yPos, { align: 'center' });
        
        yPos += 6;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Nagapattinam, Tamil Nadu", 105, yPos, { align: 'center' });
        
        yPos += 5;
        doc.text("Phone: +91 9943311192", 105, yPos, { align: 'center' });
        
        // Orange line separator
        yPos += 10;
        doc.setDrawColor(255, 102, 0);
        doc.setLineWidth(0.8);
        doc.line(20, yPos, 190, yPos);
        
        // INVOICE title in orange
        yPos += 15;
        doc.setFontSize(18);
        doc.setTextColor(255, 102, 0);
        doc.text("INVOICE", 105, yPos, { align: 'center' });
        
        // Invoice details section
        yPos += 15;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        // Safe access to order details
        const orderId = orderDetails?.id || 'N/A';
        const createdAt = orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString('en-IN') : 'N/A';
        const deliveryDate = orderDetails?.deliveryDate ? new Date(orderDetails.deliveryDate).toLocaleDateString('en-IN') : 'N/A';
        const paymentStatus = orderDetails?.paymentStatus ? orderDetails.paymentStatus.toUpperCase() : 'PENDING';
        const paymentMethod = orderDetails?.paymentMethod ? orderDetails.paymentMethod.toUpperCase() : 'N/A';
        const customerName = orderDetails?.name || 'Customer';
        const customerPhone = orderDetails?.phone || 'N/A';
        const customerEmail = orderDetails?.email || 'N/A';
        const customerAddress = orderDetails?.address || 'N/A';
        
        // Parse products from JSON string
        let products = [];
        try {
          if (typeof orderDetails?.products === 'string') {
            products = JSON.parse(orderDetails.products);
          } else if (Array.isArray(orderDetails?.products)) {
            products = orderDetails.products;
          }
        } catch (parseError) {
          console.error('Error parsing products:', parseError);
          products = [];
        }
        
        const totalPrice = orderDetails?.totalPrice || 0;
        const deliveryCharge = orderDetails?.deliveryCharge || 0;
        const subtotal = totalPrice - deliveryCharge;
        
        // Helper function to format currency
        const formatCurrency = (amount) => {
          return `₹${amount.toFixed(2)}`;
        };
        
        // Left column - Invoice Details
        doc.setFont(undefined, 'bold');
        doc.text("Invoice Details:", 20, yPos);
        doc.setFont(undefined, 'normal');
        
        doc.text(`Invoice #: ${orderId}`, 20, yPos + 7);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos + 14);
        doc.text(`Order Date: ${createdAt}`, 20, yPos + 21);
        doc.text(`Delivery Date: ${deliveryDate}`, 20, yPos + 28);
        
        // Payment Status with colored badge
        const statusX = 20;
        const statusY = yPos + 35;
        const isPaid = paymentStatus === 'PAID';
        
        if (isPaid) {
          doc.setFillColor(220, 255, 220); // Light green for PAID
        } else {
          doc.setFillColor(255, 220, 220); // Light red for other statuses
        }
        
        doc.rect(statusX, statusY - 3, 35, 6, 'F');
        
        if (isPaid) {
          doc.setTextColor(0, 100, 0); // Dark green text for PAID
        } else {
          doc.setTextColor(139, 0, 0); // Dark red text for other statuses
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Status: ${paymentStatus}`, statusX + 2, statusY);
        
        // Right column - Payment Details
        const rightColX = 120;
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text("Payment Details:", rightColX, yPos);
        doc.setFont(undefined, 'normal');
        
        doc.text(`Method: ${paymentMethod}`, rightColX, yPos + 7);
        doc.text(`Customer: ${customerName}`, rightColX, yPos + 14);
        doc.text(`Phone: ${customerPhone}`, rightColX, yPos + 21);
        if (customerEmail && customerEmail !== 'N/A') {
          doc.text(`Email: ${customerEmail}`, rightColX, yPos + 28);
        }
        
        // Customer Details section
        yPos += 50;
        doc.setFont(undefined, 'bold');
        doc.text("Customer Details:", 20, yPos);
        doc.setFont(undefined, 'normal');
        
        // Wrap address if too long
        const addressLines = doc.splitTextToSize(customerAddress, 170);
        addressLines.forEach((line, index) => {
          doc.text(line, 20, yPos + 7 + (index * 5));
        });
        
        yPos += 10 + (addressLines.length * 5);
        
        // Green line separator
        doc.setDrawColor(0, 100, 0);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Order Items Table Header with orange background
        doc.setFillColor(255, 102, 0);
        doc.rect(20, yPos, 170, 8, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text("Product", 22, yPos + 6);
        doc.text("Pack", 70, yPos + 6);
        doc.text("Qty", 110, yPos + 6);
        doc.text("Unit Price", 130, yPos + 6);
        doc.text("Total", 170, yPos + 6);
        
        yPos += 12;
        
        // Table rows
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        let rowCounter = 0;
        
        // Now products is a proper array
        products.forEach(item => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          // Alternate row colors
          if (rowCounter % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(20, yPos - 4, 170, 10, 'F');
          }
          rowCounter++;
          
          const productName = item.productName || 'Product';
          const packName = item.packName || 'Standard';
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const itemTotal = price * quantity;
          
          // Wrap product name if needed
          const productLines = doc.splitTextToSize(productName, 45);
          
          // Draw product name (first line)
          doc.text(productLines[0], 22, yPos);
          doc.text(packName, 70, yPos);
          doc.text(quantity.toString(), 110, yPos);
          
          // FIXED: Use plain text instead of formatted string for price
          doc.text(price.toString(), 130, yPos);
          
          // FIXED: Use plain text instead of formatted string for item total
          doc.text(itemTotal.toString(), 170, yPos, { align: 'right' });
          
          // Draw additional lines for product name
          if (productLines.length > 1) {
            for (let i = 1; i < productLines.length; i++) {
              yPos += 5;
              doc.text(productLines[i], 22, yPos);
            }
          }
          
          yPos += 10;
        });
        
        // Add horizontal line before totals
        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Totals section
        const totalsX = 120;
        
        // Subtotal
        doc.setFont(undefined, 'bold');
        doc.text("Subtotal:", totalsX, yPos);
        // FIXED: Use plain number for subtotal
        doc.text(subtotal.toString(), 170, yPos, { align: 'right' });
        
        yPos += 8;
        
        // Delivery Charge (if any)
        if (deliveryCharge > 0) {
          doc.setFont(undefined, 'normal');
          doc.text("Delivery Charge:", totalsX, yPos);
          // FIXED: Use plain number for delivery charge
          doc.text(deliveryCharge.toString(), 170, yPos, { align: 'right' });
          yPos += 8;
        }
        
        // Grand Total with highlight
        yPos += 5;
        doc.setFillColor(255, 248, 220); // Light orange background
        doc.rect(totalsX - 10, yPos - 6, 80, 10, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 102, 0); // Orange text
        doc.setFont(undefined, 'bold');
        doc.text("Grand Total:", totalsX, yPos);
        // FIXED: Use plain number for grand total
        doc.text(totalPrice.toString(), 170, yPos, { align: 'right' });
        
        // Final line
        yPos += 15;
        doc.setDrawColor(255, 102, 0);
        doc.setLineWidth(0.8);
        doc.line(20, yPos, 190, yPos);
        
        // Footer section
        yPos += 15;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'normal');
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 102, 0);
        doc.text("Thank you for your order!", 105, yPos, { align: 'center' });
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text("For any queries, contact: +91 9943311192", 105, yPos + 5, { align: 'center' });
        doc.text("Email: agshealthyfoods@gmail.com.com", 105, yPos + 10, { align: 'center' });
        
        // Save the PDF
        doc.save(`AG-Invoice-${orderId}.pdf`);
      }
      
    }).catch(error => {
      console.error('Error loading jsPDF:', error);
      alert('Failed to generate invoice. Please try again.');
    });
    
  } catch (err) {
    console.error('Error in invoice generation:', err);
    alert('Failed to generate invoice. Please try again.');
  }
};
// SweetAlert2 configuration
const swalConfig = {
  customClass: {
    container: '!p-3',
    popup: '!max-w-[92%] md:!max-w-md !w-full !rounded-xl !p-4 !shadow-xl',
    title: '!text-base !mb-3 !font-bold !text-gray-800',
    htmlContainer: '!text-sm !px-0 !pt-0',
    confirmButton: '!text-sm !py-3 !px-5 !rounded-lg !mt-3 !font-semibold !shadow-sm',
    cancelButton: '!text-sm !py-3 !px-5 !rounded-lg !mt-3 !font-semibold !shadow-sm',
    icon: '!mb-2 !w-12 !h-12'
  },
  width: 'auto',
  padding: 0,
  backdrop: 'rgba(0,0,0,0.5)',
  allowOutsideClick: false,
  allowEscapeKey: false,
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster'
  },
  buttonsStyling: false,
  showConfirmButton: true,
  showCancelButton: false
};

// Helper function to show modal
const showModal = ({ type = 'info', title, text, html, confirmText = 'OK', onConfirm }) => {
  const config = {
    ...swalConfig,
    title,
    confirmButtonText: confirmText,
    customClass: {
      ...swalConfig.customClass,
      confirmButton: `!text-sm !py-3 !px-5 !rounded-lg !mt-3 !font-semibold !shadow-sm ${
        type === 'warning' ? '!bg-yellow-500 hover:!bg-yellow-600' :
        type === 'error' ? '!bg-red-500 hover:!bg-red-600' :
        type === 'success' ? '!bg-green-500 hover:!bg-green-600' :
        '!bg-blue-500 hover:!bg-blue-600'
      }`
    }
  };

  if (html) {
    config.html = html;
  } else {
    config.text = text;
  }

  return Swal.fire(config).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

// Animated check icon
const showAnimatedCheck = () => {
  return Swal.fire({
    title: ' ',
    html: `
      <div class="flex flex-col items-center justify-center py-8">
        <div class="relative">
          <div class="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <svg class="w-16 h-16 text-white checkmark" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="white" stroke-width="2"/>
              <path class="checkmark__check" fill="none" stroke="white" stroke-width="4" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>
        <p class="mt-6 text-lg font-semibold text-gray-700">Processing your order...</p>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: 'rgba(0,0,0,0.8)',
    width: 'auto',
    customClass: {
      popup: '!max-w-[92%] md:!max-w-md !w-full !rounded-xl !p-6 !bg-transparent !shadow-none',
      container: '!p-3',
    },
    didOpen: () => {
      const style = document.createElement('style');
      style.textContent = `
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  });
};

// Payment methods
const PAYMENT_METHODS = [
  {
    id: "phonepay",
    name: "PhonePe",
    icon: CreditCard,
    color: "bg-purple-500",
    available: true,
    description: "UPI, Cards & Net Banking"
  }
];

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
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
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Delivery points configuration
  const DELIVERY_POINTS = [
    { id: "point_a", name: "Delivery Point A", address: "Dr. Rajarethinam Homeopathic Clinic, Poornam Tower, Neela South Street, Nagapattinam.", freeDelivery: true },
    { id: "point_b", name: "Delivery Point B", address: "Mr. Fit Gym, Public Office Road, Nagapattinam (Near Collector Office).", freeDelivery: true },
    { id: "point_c", name: "Delivery Point C", address: "Arthi Medicals, Public Office Road, Near NDHS School, Velipalayam, Nagapattinam.", freeDelivery: true },
    { id: "home_delivery", name: "Home Delivery", address: "Deliver to my address", freeDelivery: false, charge: 10 }
  ];

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("cartItems")) || [];
    setCartItems(stored);
    
    const getAutoDeliveryDate = () => {
      if (stored.length > 0 && stored[0].deliveryDate) {
        return stored[0].deliveryDate;
      }
      
      const storedDate = sessionStorage.getItem('selectedDeliveryDate');
      if (storedDate) {
        sessionStorage.removeItem('selectedDeliveryDate');
        return storedDate;
      }
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };
    
    setDeliveryDate(getAutoDeliveryDate());
  }, []);

  const updateCart = (updated) => {
    setCartItems(updated);
    sessionStorage.setItem("cartItems", JSON.stringify(updated));
    
    if (updated.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeliveryDate(tomorrow.toISOString().split('T')[0]);
    }
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

  const handleDeliveryPointChange = (pointId) => {
    setSelectedDeliveryPoint(pointId);
    const point = DELIVERY_POINTS.find(p => p.id === pointId);
    setDeliveryCharge(point?.freeDelivery ? 0 : (point?.charge || 0));
  };

  const getMinDate = () => {
    const minDate = new Date();
    
    if (cartItems.length > 0 && cartItems[0].deliveryDate) {
      const itemDate = new Date(cartItems[0].deliveryDate);
      if (itemDate < minDate) {
        return itemDate.toISOString().split('T')[0];
      }
    }
    
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const formatDeliveryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Store order data for invoice generation
  const storeOrderForInvoice = (orderData) => {
    // Store both in sessionStorage for access in PaymentResult
    sessionStorage.setItem('lastOrderId', orderData.id);
    sessionStorage.setItem('lastOrderData', JSON.stringify(orderData));
  };

  // Handle PhonePe Payment
  const handlePhonePePayment = async (orderData) => {
    try {
      setPaymentProcessing(true);
      
      const redirectUrl = `${window.location.origin}/payment-result`;
      
      console.log('Initiating PhonePe payment for order:', orderData.id);
      
      const paymentRes = await axiosInstance.post("/api/payments/initiate", {
        orderId: orderData.id,
        amount: Math.round(total),
        customerPhone: customer.phone,
        customerEmail: customer.email,
        redirectUrl: redirectUrl
      }, {
        withCredentials: true,
      });

      console.log('Payment initiation response:', paymentRes.data);

      if (paymentRes.data.success && paymentRes.data.data.paymentUrl) {
        // Store order data before redirecting
        storeOrderForInvoice(orderData);
        window.location.href = paymentRes.data.data.paymentUrl;
      } else {
        if (paymentRes.data.data?.testUrl) {
          console.log('Using test URL for development');
          // Store order data before redirecting
          storeOrderForInvoice(orderData);
          window.location.href = paymentRes.data.data.testUrl;
        } else {
          throw new Error(paymentRes.data.message || "Payment initiation failed");
        }
      }

    } catch (error) {
      console.error("PhonePe payment error:", error);
      console.error("Error details:", error.response?.data);
      
      await showModal({
        type: 'error',
        title: "Payment Failed",
        text: error.response?.data?.message || 
              error.response?.data?.error || 
              error.message || 
              "Failed to initiate payment. Please try again.",
        confirmText: 'Try Again'
      });
      
      setPaymentProcessing(false);
      setShowPaymentOptions(false);
    }
  };

  const placeOrder = async () => {
    if (!customer.name || !customer.phone || !selectedDeliveryPoint || !deliveryDate) {
      await showModal({
        type: 'warning',
        title: "Incomplete Details",
        text: "Please fill name, phone, select delivery point, and choose delivery date to place order.",
        confirmText: 'Got it'
      });
      return;
    }

    if (!/^\d{10}$/.test(customer.phone)) {
      await showModal({
        type: 'warning',
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit phone number.",
        confirmText: 'Got it'
      });
      return;
    }

    if (selectedDeliveryPoint === 'home_delivery' && !customer.address.trim()) {
      await showModal({
        type: 'warning',
        title: "Address Required",
        text: "Please enter your delivery address for home delivery.",
        confirmText: 'Got it'
      });
      return;
    }

    setShowPaymentOptions(true);
  };

  const confirmOrderWithPayment = async (paymentMethod) => {
    setPaymentProcessing(true);
    setSelectedPaymentMethod(paymentMethod);

    const selectedPoint = DELIVERY_POINTS.find(p => p.id === selectedDeliveryPoint);
    const finalAddress = selectedPoint.id === 'home_delivery' 
      ? customer.address 
      : `${selectedPoint.name}, ${selectedPoint.address}`;

    const orderPayload = {
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
        deliveryDate: ci.deliveryDate,
      })),
      totalPrice: Math.round(total),
      deliveryPoint: selectedDeliveryPoint,
      deliveryCharge: deliveryCharge,
      deliveryDate: deliveryDate,
      paymentMethod: paymentMethod,
      paymentStatus: "pending"
    };

    try {
      const checkModal = showAnimatedCheck();

      // 1. First place the order and get database order ID
      const orderRes = await axiosInstance.post("/api/orders", orderPayload, {
        withCredentials: true,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      Swal.close();

      if (!(orderRes.status === 200 || orderRes.status === 201)) {
        throw new Error("Order placement failed");
      }

      const orderData = orderRes.data.order;
      const dbOrderId = orderData.id;
      
      // Store order data for invoice generation
      storeOrderForInvoice(orderData);
      
      if (paymentMethod === "phonepay") {
        // 2. For PhonePe, initiate payment with the database order ID
        await handlePhonePePayment(orderData);
        return;
      }
      
      // 3. For cash on delivery, show success immediately
      // Clear cart
      sessionStorage.removeItem('cartItems');
      setCartItems([]);
      
      // Generate and download invoice
      generateInvoice(orderData);
      
      // Show success message
      await showModal({
        type: 'success',
        title: "Order Placed Successfully!",
        html: `
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-500" />
            </div>
            <p class="text-gray-700 mb-2">Your order has been placed successfully!</p>
            <div class="bg-gray-50 p-3 rounded-lg text-left">
              <p class="text-sm"><strong>Order ID:</strong> ${dbOrderId}</p>
              <p class="text-sm"><strong>Amount:</strong> ₹${total.toFixed(2)}</p>
              <p class="text-sm"><strong>Delivery Date:</strong> ${formatDeliveryDate(deliveryDate)}</p>
            </div>
            <p class="text-xs text-gray-500 mt-3">Your invoice has been downloaded automatically.</p>
          </div>
        `,
        confirmText: 'Continue Shopping',
        onConfirm: () => navigate('/')
      });
      
    } catch (err) {
      console.error("Failed to place order:", err);
      Swal.close();
      
      await showModal({
        type: 'error',
        title: "Order Failed",
        text: err.response?.data?.message || err.message || "Failed to place order. Please try again.",
        confirmText: 'Try Again'
      });
    } finally {
      setPaymentProcessing(false);
      setShowPaymentOptions(false);
      setSelectedPaymentMethod(null);
    }
  };

  // Payment Options Modal
  const PaymentOptionsModal = () => {
    if (!showPaymentOptions) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-xl w-full max-w-[95%] md:max-w-md mx-3"
        >
          <div className="p-4 md:p-6">
            <div className="text-center mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <CreditCard className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                Complete Payment
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Total: <span className="font-bold text-green-600">₹${total.toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg md:rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? "border-purple-500 bg-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className={`${method.color} p-1.5 md:p-2 rounded-lg flex-shrink-0`}>
                        <method.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                          {method.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {selectedPaymentMethod === method.id && (
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 md:space-y-3">
              <button
                onClick={() => confirmOrderWithPayment(selectedPaymentMethod)}
                disabled={!selectedPaymentMethod || paymentProcessing}
                className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold shadow transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${
                  !selectedPaymentMethod || paymentProcessing
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="md:w-5 md:h-5" />
                    Pay Now
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowPaymentOptions(false);
                  setSelectedPaymentMethod(null);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 md:px-6 rounded-lg font-medium transition-all duration-300 text-sm md:text-base"
                disabled={paymentProcessing}
              >
                Cancel
              </button>
            </div>

            {selectedPaymentMethod === "phonepay" && (
              <div className="mt-3 md:mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-800 font-medium">
                      Secure Online Payment
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      You will be redirected to PhonePe's secure payment page
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-base mb-2">
              Your cart is empty
            </p>
            <p className="text-orange-500 font-semibold text-sm">
              Add something healthy to your basket!
            </p>
          </motion.div>
        ) : (
          <>
            {cartItems.length > 0 && cartItems[0].deliveryDate && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>
                    <strong>Delivery Date:</strong> {formatDeliveryDate(cartItems[0].deliveryDate)}
                  </span>
                </div>
              </div>
            )}

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

                      {item.deliveryDate && item.deliveryDate !== deliveryDate && (
                        <div className="text-xs text-purple-600 mt-1">
                          For: {formatDeliveryDate(item.deliveryDate)}
                        </div>
                      )}

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
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 font-semibold text-gray-800 text-xs min-w-[24px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 active:bg-red-600 rounded-lg transition-colors"
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
                <span className="text-green-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <AnimatePresence>
              {showCustomerForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-700">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="Full Name *"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="Phone Number (10 digits) *"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                      required
                    />
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="Email (optional)"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                    
                    <div className="relative">
                      <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar size={14} />
                        Delivery Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={getMinDate()}
                          max={getMaxDate()}
                          required
                          readOnly
                        />
                      </div>
                      {deliveryDate && (
                        <div>
                          <p className="text-xs text-purple-600 mt-1 font-medium">
                            {formatDeliveryDate(deliveryDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2 text-xs md:col-span-2 text-gray-600">
                      <input
                        type="checkbox"
                        checked={customer.wantsOffers}
                        onChange={(e) => setCustomer({ ...customer, wantsOffers: e.target.checked })}
                        className="rounded text-green-500 focus:ring-green-400"
                      />
                      I want to receive offer emails
                    </label>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      Select Delivery Point *
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {DELIVERY_POINTS.map((point) => (
                        <label
                          key={point.id}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                            selectedDeliveryPoint === point.id
                              ? "border-green-500 bg-green-50 shadow-sm"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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

                    {selectedDeliveryPoint === 'home_delivery' && (
                      <div className="mt-3">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all text-sm"
                          placeholder="Enter your complete delivery address with landmark *"
                          rows={3}
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              {!showCustomerForm ? (
                <motion.button
                  onClick={() => setShowCustomerForm(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300"
                >
                  Proceed to Payment
                </motion.button>
              ) : (
                <motion.button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: placingOrder ? 1 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3 text-sm md:text-base rounded-lg font-semibold shadow-md transition-all duration-300 ${
                    placingOrder
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                  }`}
                >
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Processing...
                    </span>
                  ) : (
                    `Pay Now - ₹${total.toFixed(2)}`
                  )}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>

      <PaymentOptionsModal />
    </div>
  );
}