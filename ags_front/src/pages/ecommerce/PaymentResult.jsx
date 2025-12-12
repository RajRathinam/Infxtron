import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  ArrowLeft, 
  Home, 
  RefreshCw,
  CreditCard,
  Shield,
  Package,
  Phone,
  AlertCircle,
  Download,
  FileText,
  Calendar,
  MapPin,
  User,
  Mail,
  Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig.js';

// Helper function to parse products
const parseProducts = (products) => {
  if (!products) return [];
  
  try {
    if (typeof products === 'string') {
      return JSON.parse(products);
    } else if (Array.isArray(products)) {
      return products;
    }
    return [];
  } catch (error) {
    console.error('Error parsing products:', error);
    return [];
  }
};

// Beautiful Invoice generation function with Orange theme and logo - OPTIMIZED
const generateInvoice = (orderDetails) => {
  try {
    // Import jsPDF dynamically
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      // Define colors
      const primaryColor = [255, 102, 0]; // Orange (#FF6600)
      const secondaryColor = [0, 100, 0]; // Dark Green (#006400)
      const lightOrange = [255, 230, 200]; // Light orange background
      const darkText = [51, 51, 51]; // Dark gray text
      const lightGray = [240, 240, 240]; // Light gray for alternation
      
      let yPos = 10; // Start position
      
      // Add logo and header
      try {
        const logoUrl = '/Logo.png';
        
        // Try to load logo
        const img = new Image();
        img.src = logoUrl;
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
          // Draw logo with smaller dimensions
          doc.addImage(img, 'PNG', 20, yPos, 25, 25); // Smaller logo
          drawInvoiceContent(yPos + 30); // Start content after logo
        };
        
        img.onerror = function() {
          console.log('Logo not found, using text header');
          drawInvoiceContent(yPos); // Start content without logo
        };
        
      } catch (logoErr) {
        drawInvoiceContent(yPos);
      }
      
      function drawInvoiceContent(startY) {
        yPos = startY;
        
        // If no logo, add text header
        if (startY === 10) {
          // Header with orange background
          doc.setFillColor(...primaryColor);
          doc.rect(15, yPos, 180, 15, 'F');
          
          // Company name in white
          doc.setFontSize(16);
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
          doc.text("AG's Healthy Food", 105, yPos + 10, { align: 'center' });
          
          yPos += 25;
        }
        
        // Invoice title
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text("INVOICE", 105, yPos, { align: 'center' });
        
        // Orange underline
        yPos += 8;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.8);
        doc.line(50, yPos, 160, yPos);
        
        yPos += 10;
        
        // Invoice and order details in two columns
        doc.setFontSize(9); // Smaller font for better fit
        doc.setTextColor(...darkText);
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
        
        // Parse products correctly
        const products = parseProducts(orderDetails?.products);
        
        const totalPrice = orderDetails?.totalPrice || 0;
        const deliveryCharge = orderDetails?.deliveryCharge || 0;
        const subtotal = totalPrice - deliveryCharge;
        
        // Left column - Invoice Details
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text("INVOICE DETAILS", 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...darkText);
        
        doc.text(`Invoice #: ${orderId}`, 20, yPos + 6);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos + 12);
        doc.text(`Order Date: ${createdAt}`, 20, yPos + 18);
        doc.text(`Delivery: ${deliveryDate}`, 20, yPos + 24);
        
        // Payment status with colored badge
        const statusY = yPos + 30;
        const statusText = paymentStatus;
        
        if (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS') {
          doc.setFillColor(220, 255, 220); // Light green
          doc.setTextColor(0, 100, 0); // Dark green
        } else {
          doc.setFillColor(255, 240, 240); // Light red
          doc.setTextColor(139, 0, 0); // Dark red
        }
        
        doc.roundedRect(20, statusY - 3, 35, 6, 1, 1, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(8);
        doc.text(statusText, 22, statusY);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...darkText);
        
        // Right column - Customer Details
        const rightColX = 110; // Moved left for better fit
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text("CUSTOMER DETAILS", rightColX, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...darkText);
        
        doc.text(`Name: ${customerName}`, rightColX, yPos + 6);
        doc.text(`Phone: ${customerPhone}`, rightColX, yPos + 12);
        if (customerEmail && customerEmail !== 'N/A') {
          doc.text(`Email: ${customerEmail}`, rightColX, yPos + 18);
          yPos += 6; // Extra spacing if email exists
        }
        
        // Calculate position for address based on whether email exists
        const addressStartY = (customerEmail && customerEmail !== 'N/A') ? yPos + 24 : yPos + 18;
        
        // Address header
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text("Address:", rightColX, addressStartY);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...darkText);
        
        // Address (wrapped)
        const addressLines = doc.splitTextToSize(customerAddress, 75);
        addressLines.forEach((line, index) => {
          doc.text(line, rightColX + 15, addressStartY + (index * 4));
        });
        
        // Calculate yPos based on maximum of left/right column heights
        const leftColumnHeight = statusY + 10;
        const addressHeight = addressStartY + (addressLines.length * 4);
        yPos = Math.max(leftColumnHeight, addressHeight) + 8;
        
        // Products section
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text("ORDER ITEMS", 20, yPos);
        yPos += 5;
        
        // Table header with orange background
        doc.setFillColor(...primaryColor);
        doc.rect(20, yPos, 170, 6, 'F'); // Smaller header
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text("Product", 22, yPos + 4.5);
        doc.text("Pack", 90, yPos + 4.5);
        doc.text("Qty", 120, yPos + 4.5);
        doc.text("Price", 140, yPos + 4.5);
        doc.text("Total", 170, yPos + 4.5, { align: 'right' });
        
        yPos += 10;
        
        // Table rows
        doc.setFontSize(9);
        doc.setTextColor(...darkText);
        doc.setFont(undefined, 'normal');
        
        let rowCounter = 0;
        
        products.forEach((item, index) => {
          // Check if we need a new page (leave room for totals)
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
            // Add continuation header
            doc.setFontSize(9);
            doc.setTextColor(...primaryColor);
            doc.setFont(undefined, 'bold');
            doc.text("AG's Healthy Food - Invoice (Continued)", 105, 10, { align: 'center' });
            yPos = 15;
          }
          
          // Alternate row colors
          if (rowCounter % 2 === 0) {
            doc.setFillColor(...lightGray);
            doc.rect(20, yPos - 3, 170, 8, 'F');
          }
          rowCounter++;
          
          const productName = item.productName || 'Product';
          const packName = item.packName || 'Standard';
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const itemTotal = price * quantity;
          
          // Wrap product name if needed (narrower width)
          const productLines = doc.splitTextToSize(productName, 60);
          
          // Draw product name (first line)
          doc.text(productLines[0], 22, yPos);
          doc.text(packName, 90, yPos);
          doc.text(quantity.toString(), 120, yPos);
          doc.text(`₹${price.toFixed(2)}`, 140, yPos);
          doc.text(`₹${itemTotal.toFixed(2)}`, 170, yPos, { align: 'right' });
          
          // Draw additional lines for product name
          if (productLines.length > 1) {
            for (let i = 1; i < productLines.length; i++) {
              yPos += 4;
              doc.text(productLines[i], 22, yPos);
            }
          }
          
          yPos += 8; // Reduced spacing between rows
        });
        
        // Separator line before totals
        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 8;
        
        // Totals section
        const totalsX = 120;
        
        // Subtotal
        doc.setFont(undefined, 'bold');
        doc.text("Subtotal:", totalsX, yPos);
        doc.text(`₹${subtotal.toFixed(2)}`, 170, yPos, { align: 'right' });
        
        yPos += 7;
        
        // Delivery Charge
        if (deliveryCharge > 0) {
          doc.setFont(undefined, 'normal');
          doc.text("Delivery Charge:", totalsX, yPos);
          doc.text(`₹${deliveryCharge.toFixed(2)}`, 170, yPos, { align: 'right' });
          yPos += 7;
        }
        
        // Grand Total with orange highlight
        yPos += 4;
        doc.setFillColor(...lightOrange);
        doc.roundedRect(totalsX - 10, yPos - 5, 80, 8, 2, 2, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text("GRAND TOTAL:", totalsX, yPos);
        doc.text(`₹${totalPrice.toFixed(2)}`, 170, yPos, { align: 'right' });
        
        // Payment method
        yPos += 12;
        doc.setFontSize(9);
        doc.setTextColor(...darkText);
        doc.setFont(undefined, 'bold');
        doc.text(`Payment Method: ${paymentMethod}`, 20, yPos);
        
        // Thank you message in orange
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text("Thank you for your order!", 105, yPos, { align: 'center' });
        
        // Contact information (only if space available)
        if (yPos < 270) {
          yPos += 7;
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont(undefined, 'normal');
          
          doc.text("For any queries or support, please contact:", 105, yPos, { align: 'center' });
          yPos += 4;
          doc.text("Phone: +91 9943311192", 105, yPos, { align: 'center' });
          yPos += 4;
          doc.text("Email: agshealthyfoods@gmail.com", 105, yPos, { align: 'center' });
          yPos += 4;
          doc.text("Nagapattinam, Tamil Nadu", 105, yPos, { align: 'center' });
          
          // Footer border (only if space available)
          if (yPos < 280) {
            yPos += 6;
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.3);
            doc.line(20, yPos, 190, yPos);
            
            // Footer text
            yPos += 4;
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text("AG's Healthy Food - Healthy & Fresh Food Delivery", 105, yPos, { align: 'center' });
          }
        }
        
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
const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  // Parse order details to ensure products is an array
  const getParsedOrderDetails = (order) => {
    if (!order) return null;
    
    return {
      ...order,
      // Parse products field
      products: parseProducts(order.products)
    };
  };

  // Function to fetch order by ID from backend
  const fetchOrderById = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId}`, {
        withCredentials: true
      });
      
      if (response.data.order) {
        const parsedOrder = getParsedOrderDetails(response.data.order);
        setOrderDetails(parsedOrder);
        // Store in sessionStorage for persistence
        sessionStorage.setItem('currentOrderDetails', JSON.stringify(parsedOrder));
        return parsedOrder;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  const verifyPayment = async (orderId, transactionId) => {
    setVerifying(true);
    try {
      const verifyRes = await axiosInstance.post('/api/payments/verify', {
        orderId,
        transactionId
      }, { withCredentials: true });
      
      if (verifyRes.data.success) {
        const status = verifyRes.data.data?.transaction?.paymentStatus;
        
        if (status === 'SUCCESS' || status === 'paid') {
          setPaymentStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          sessionStorage.removeItem('cartItems');
          
          // Try to fetch fresh order data from backend
          if (orderId) {
            const freshOrder = await fetchOrderById(orderId);
            if (freshOrder) {
              setOrderDetails(freshOrder);
            } else {
              // Fallback to stored order data
              const storedOrderData = sessionStorage.getItem('lastOrderData');
              if (storedOrderData) {
                const orderData = JSON.parse(storedOrderData);
                setOrderDetails(getParsedOrderDetails(orderData));
              }
            }
          }
          return true;
        } else if (status === 'FAILED' || status === 'failed') {
          setPaymentStatus('failed');
          setMessage('Payment failed. Please try again.');
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const checkOrderStatus = async (orderId) => {
    try {
      const orderRes = await axiosInstance.get(`/api/orders/${orderId}`, {
        withCredentials: true
      });
      
      if (orderRes.data.order) {
        const parsedOrder = getParsedOrderDetails(orderRes.data.order);
        
        if (parsedOrder.paymentStatus === 'paid' || parsedOrder.paymentStatus === 'completed') {
          setPaymentStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          sessionStorage.removeItem('cartItems');
          sessionStorage.removeItem('lastOrderData');
          setOrderDetails(parsedOrder);
          return true;
        } else if (parsedOrder.paymentStatus === 'failed') {
          setPaymentStatus('failed');
          setMessage('Payment failed. Please try again.');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Order status check error:', error);
      return false;
    }
  };

  const handleManualVerify = async () => {
    const orderId = searchParams.get('order');
    const transactionId = searchParams.get('transaction');
    
    if (orderId || transactionId) {
      setVerificationAttempts(prev => prev + 1);
      await verifyPayment(orderId, transactionId);
    }
  };

  const handleDownloadInvoice = () => {
    if (orderDetails) {
      setDownloadingInvoice(true);
      try {
        generateInvoice(orderDetails);
        setInvoiceGenerated(true);
      } catch (err) {
        console.error('Error generating invoice:', err);
        alert('Failed to generate invoice. Please try again.');
      } finally {
        setDownloadingInvoice(false);
      }
    } else {
      alert('Order details not available. Please wait for the order to be confirmed.');
    }
  };

  // Auto-generate invoice when order details are available and payment is successful
  useEffect(() => {
    if (paymentStatus === 'success' && orderDetails && !invoiceGenerated) {
      // Auto-generate invoice after 1 second
      const timer = setTimeout(() => {
        try {
          generateInvoice(orderDetails);
          setInvoiceGenerated(true);
        } catch (err) {
          console.error('Auto-invoice generation failed:', err);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, orderDetails, invoiceGenerated]);

  useEffect(() => {
    const processPaymentResult = async () => {
      // Check if we have order data passed from Cart component (for COD)
      if (location.state?.orderData) {
        const parsedOrder = getParsedOrderDetails(location.state.orderData);
        setOrderDetails(parsedOrder);
        setPaymentStatus('success');
        setMessage('Order placed successfully!');
        sessionStorage.removeItem('cartItems');
        return;
      }
      
      // Check for stored order ID in sessionStorage
      const storedOrderId = sessionStorage.getItem('lastOrderId');
      const storedOrderData = sessionStorage.getItem('lastOrderData');
      
      // Check if we have PhonePe callback parameters
      const transactionId = searchParams.get('transaction');
      const merchantTransactionId = searchParams.get('merchantTransactionId');
      const orderId = searchParams.get('order') || storedOrderId;
      
      if (orderId || transactionId || merchantTransactionId) {
        // We have payment callback, need to verify payment
        if (storedOrderData) {
          try {
            const orderData = JSON.parse(storedOrderData);
            setOrderDetails(getParsedOrderDetails(orderData));
          } catch (err) {
            console.error('Error parsing stored order data:', err);
          }
        }
        
        const verified = await verifyPayment(orderId, transactionId || merchantTransactionId);
        
        if (!verified) {
          // If verification didn't confirm success, check order status
          if (orderId) {
            await checkOrderStatus(orderId);
          } else {
            setPaymentStatus('pending');
            setMessage('Waiting for payment confirmation...');
          }
        }
        return;
      }
      
      // If no callback params, check if we have stored order data
      if (storedOrderData) {
        try {
          const orderData = JSON.parse(storedOrderData);
          const parsedOrder = getParsedOrderDetails(orderData);
          setOrderDetails(parsedOrder);
          setPaymentStatus('success');
          setMessage('Order placed successfully!');
          sessionStorage.removeItem('cartItems');
          sessionStorage.removeItem('lastOrderData');
        } catch (err) {
          console.error('Error processing stored order:', err);
        }
        return;
      }
      
      // If no stored data and no parameters
      setPaymentStatus('unknown');
      setMessage('No payment details found. Please check your order history.');
    };

    processPaymentResult();
  }, [searchParams, location]);

  useEffect(() => {
    if (paymentStatus === 'pending' && verificationAttempts < 6) {
      const pollInterval = setInterval(async () => {
        const orderId = searchParams.get('order') || sessionStorage.getItem('lastOrderId');
        const transactionId = searchParams.get('transaction');
        
        if (orderId || transactionId) {
          setVerificationAttempts(prev => prev + 1);
          await verifyPayment(orderId, transactionId);
        }
      }, 5000);
      
      return () => clearInterval(pollInterval);
    }
  }, [paymentStatus, verificationAttempts, searchParams]);

  // Parse products for display
  const displayProducts = parseProducts(orderDetails?.products);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-4 md:p-8 max-w-md w-full border border-gray-200"
      >
        <div className="text-center">
          
          {/* Processing State */}
          {paymentStatus === 'processing' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                  <Loader className="w-12 h-12 text-blue-500" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Processing Payment...
              </h2>
              <p className="text-gray-600 mb-6">
                Please wait while we verify your payment.
              </p>
              
              <div className="space-y-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "70%" }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Verifying transaction...
                </p>
              </div>
            </>
          )}
          
          {/* Success State */}
          {paymentStatus === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              {orderDetails && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-700">Order Details</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Order ID:</span>
                        <span className="text-sm font-medium text-gray-800">{orderDetails.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-bold text-green-600">₹{orderDetails.totalPrice || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="text-sm font-medium text-gray-800">{orderDetails.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                          CONFIRMED
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Order Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-700">Customer Details</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{orderDetails.name || 'Customer'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{orderDetails.phone || 'N/A'}</span>
                        </div>
                        {orderDetails.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-800">{orderDetails.email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{orderDetails.address || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">
                            Delivery: {orderDetails.deliveryDate ? new Date(orderDetails.deliveryDate).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {displayProducts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Receipt className="w-4 h-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-700">Items Ordered</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {displayProducts.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{item.productName || 'Product'}</p>
                                <p className="text-xs text-gray-500">{item.packName || 'Standard'} × {item.quantity || 1}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">₹{(item.price || 0).toFixed(2)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Invoice Download Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Download Invoice</h3>
                      </div>
                      
                      <p className="text-sm text-blue-700 mb-4">
                        {invoiceGenerated 
                          ? "Invoice has been downloaded automatically. You can download it again if needed."
                          : "Save your invoice for future reference. It contains all order details."
                        }
                      </p>
                      
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleDownloadInvoice}
                          disabled={downloadingInvoice}
                          className={`bg-gradient-to-r text-xs from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                            downloadingInvoice ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {downloadingInvoice ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download Invoice PDF
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">
                              Your order is confirmed and secured
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              You will receive a confirmation call soon. Keep this invoice for reference.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-green-500 text-xs hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
            </>
          )}
          
          {/* Failed State */}
          {paymentStatus === 'failed' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-blue-500 text-xs hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Payment Again
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-500 text-xs hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Back to Home
                </button>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Need help? Contact support:</p>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <p className="font-medium text-blue-600">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Pending State */}
          {paymentStatus === 'pending' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto border border-yellow-100">
                  <Loader className="w-12 h-12 text-yellow-500" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Verifying Payment
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-sm text-yellow-800 mb-3">
                    We're confirming your payment with PhonePe. This may take a few moments.
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Verification attempts:</span>
                    <span className="font-medium">{verificationAttempts}/6</span>
                  </div>
                  
                  {verificationAttempts >= 3 && (
                    <div className="flex items-center gap-2 mt-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-red-600">
                        If payment was successful but still shows as pending, please contact support.
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleManualVerify}
                  disabled={verifying}
                  className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Check Payment Status Again
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-500 text-xs hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Note:</p>
                <p>Your payment may take a few minutes to process. You'll receive an email confirmation once completed.</p>
              </div>
            </>
          )}
          
          {/* Unknown/Error State */}
          {(paymentStatus === 'unknown' || paymentStatus === 'error') && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto border border-gray-200">
                  <AlertCircle className="w-12 h-12 text-gray-500" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Payment Status Unknown
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleManualVerify}
                  disabled={verifying}
                  className="w-full bg-blue-500 text-xs hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Try to Verify Payment
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-500 text-xs hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Back to Home
                </button>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">If you made a payment but don't see it here, please contact support:</p>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <p className="font-medium text-blue-600">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResult;