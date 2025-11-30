// controllers/paymentController.js
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";
import axios from "axios";

// Generate unique transaction IDs
const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMerchantTransactionId = () => `MTXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// PhonePe configuration
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
  baseUrl: process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox"
};

// Validate PhonePe configuration
const validatePhonePeConfig = () => {
  if (!PHONEPE_CONFIG.merchantId || PHONEPE_CONFIG.merchantId === 'YOUR_ACTUAL_MERCHANT_ID') {
    throw new Error('PhonePe merchant ID not configured');
  }
  if (!PHONEPE_CONFIG.saltKey || PHONEPE_CONFIG.saltKey === 'YOUR_ACTUAL_SALT_KEY') {
    throw new Error('PhonePe salt key not configured');
  }
};

// Generate PhonePe signature
const generateSignature = (payload) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return hash + '###' + PHONEPE_CONFIG.saltIndex;
};

// Verify PhonePe signature
const verifySignature = (response, signature) => {
  const base64Payload = Buffer.from(JSON.stringify(response)).toString('base64');
  const stringToHash = base64Payload + PHONEPE_CONFIG.saltKey;
  const computedHash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return computedHash === signature;
};

// Initiate PhonePe Payment
export const initiatePayment = async (req, res) => {
  let currentOrderId; // Define at function scope
  
  try {
    const { orderId, amount, customerPhone, customerEmail, redirectUrl } = req.body;
    currentOrderId = orderId; // Assign to scoped variable

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: "Order ID and amount are required" 
      });
    }

    // Validate PhonePe configuration
    try {
      validatePhonePeConfig();
    } catch (configError) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error",
        error: configError.message
      });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid" || order.paymentStatus === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Order is already paid" 
      });
    }

    // Generate transaction IDs
    const transactionId = generateTransactionId();
    const merchantTransactionId = generateMerchantTransactionId();

    // Prepare payment payload for PhonePe
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: merchantTransactionId,
      amount: amount * 100, // Convert to paise
      merchantUserId: `CUST_${order.customerId}`,
      redirectUrl: redirectUrl || `${process.env.FRONTEND_URL}/payment-success`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/callback`,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    console.log('PhonePe Payload:', payload);

    // Generate signature
    const signature = generateSignature(payload);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    console.log('Generated Signature:', signature);
    console.log('Base64 Payload:', base64Payload);

    // Create transaction record
    const transaction = await Transaction.create({
      orderId: order.id,
      transactionId: transactionId,
      merchantTransactionId: merchantTransactionId,
      amount: amount * 100, // Store in paise
      paymentStatus: "PENDING",
      gatewayResponse: { payload, base64Payload, signature }
    });

    // Update order payment method and transaction ID
    await order.update({
      paymentMethod: "phonepay",
      transactionId: transactionId,
      paymentStatus: "pending"
    });

    // Make API call to PhonePe
    const response = await axios.post(
      `${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': signature,
          'accept': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('PhonePe API Response:', response.data);

    // Check if response is successful
    if (response.data.success && response.data.data && response.data.data.instrumentResponse) {
      const paymentUrl = response.data.data.instrumentResponse.redirectInfo?.url;
      
      if (!paymentUrl) {
        throw new Error('Payment URL not received from PhonePe');
      }

      // Update transaction with gateway response
      await transaction.update({
        gatewayResponse: {
          ...transaction.gatewayResponse,
          apiResponse: response.data
        },
        redirectUrl: paymentUrl
      });

      res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: {
          paymentUrl: paymentUrl,
          transactionId: transactionId,
          merchantTransactionId: merchantTransactionId,
          orderId: order.id,
          amount: amount
        }
      });
    } else {
      throw new Error(response.data.message || 'Payment initiation failed');
    }

  } catch (error) {
    console.error("Payment initiation error:", error);
    
    // Update transaction as failed in case of error
    if (currentOrderId) {
      try {
        await Transaction.update(
          { paymentStatus: "FAILED" },
          { where: { orderId: currentOrderId } }
        );
        
        // Also update order status
        const failedOrder = await Order.findByPk(currentOrderId);
        if (failedOrder) {
          await failedOrder.update({
            paymentStatus: "failed"
          });
        }
      } catch (updateError) {
        console.error("Error updating failed transaction:", updateError);
      }
    }

    // Provide more specific error messages
    let errorMessage = "Failed to initiate payment";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage, 
      error: error.response?.data || error.message,
      details: "Please check your PhonePe configuration"
    });
  }
};

// Payment Callback Handler
export const paymentCallback = async (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response) {
      return res.status(400).json({ 
        success: false,
        message: "No response data received" 
      });
    }

    // Decode base64 response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf8'));
    
    console.log('PhonePe Callback Data:', decodedResponse);

    const { 
      merchantTransactionId, 
      transactionId: gatewayTransactionId,
      amount,
      state,
      responseCode
    } = decodedResponse;

    // Find transaction
    const transaction = await Transaction.findOne({ 
      where: { merchantTransactionId } 
    });

    if (!transaction) {
      console.error('Transaction not found for merchantTransactionId:', merchantTransactionId);
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }

    // Determine payment status
    let paymentStatus = "PENDING";
    if (state === "COMPLETED") {
      paymentStatus = "SUCCESS";
    } else if (state === "FAILED") {
      paymentStatus = "FAILED";
    } else if (state === "CANCELLED") {
      paymentStatus = "CANCELLED";
    }

    // Update transaction with callback data
    await transaction.update({
      callbackData: decodedResponse,
      paymentStatus: paymentStatus
    });

    // Update order payment status
    const order = await Order.findByPk(transaction.orderId);
    if (order) {
      let orderPaymentStatus = "pending";
      if (state === "COMPLETED") {
        orderPaymentStatus = "paid";
      } else if (state === "FAILED") {
        orderPaymentStatus = "failed";
      } else if (state === "CANCELLED") {
        orderPaymentStatus = "cancelled";
      }

      await order.update({
        paymentStatus: orderPaymentStatus,
        transactionId: gatewayTransactionId || order.transactionId
      });
    }

    // Return success response to PhonePe
    res.status(200).json({
      success: true,
      code: "PAYMENT_SUCCESS",
      message: "Payment processed successfully"
    });

  } catch (error) {
    console.error("Payment callback error:", error);
    
    res.status(500).json({ 
      success: false,
      message: "Payment callback processing failed", 
      error: error.message 
    });
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ 
      where: { transactionId },
      include: [Order]
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          merchantTransactionId: transaction.merchantTransactionId,
          amount: transaction.amount / 100, // Convert back to rupees
          paymentStatus: transaction.paymentStatus,
          createdAt: transaction.createdAt
        },
        order: {
          id: transaction.Order.id,
          status: transaction.Order.status,
          totalPrice: transaction.Order.totalPrice,
          paymentStatus: transaction.Order.paymentStatus
        }
      }
    });

  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get payment status", 
      error: error.message 
    });
  }
};

// Check PhonePe Configuration
export const checkPhonePeConfig = async (req, res) => {
  try {
    validatePhonePeConfig();
    
    res.status(200).json({
      success: true,
      message: "PhonePe configuration is valid",
      config: {
        merchantId: PHONEPE_CONFIG.merchantId ? 'Configured' : 'Not configured',
        saltKey: PHONEPE_CONFIG.saltKey ? 'Configured' : 'Not configured',
        baseUrl: PHONEPE_CONFIG.baseUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PhonePe configuration error",
      error: error.message
    });
  }
};