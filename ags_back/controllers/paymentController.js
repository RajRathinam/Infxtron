// controllers/paymentController.js
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import telegramService from '../services/telegramService.js';



// Try to load PhonePe SDK
let PhonePeSDK;
try {
  const sdkModule = await import('pg-sdk-node');
  PhonePeSDK = sdkModule.default || sdkModule;
  console.log('✅ PhonePe SDK loaded successfully');
} catch (error) {
  console.error('❌ Failed to load PhonePe SDK:', error.message);
  console.log('💡 Run: npm install pg-sdk-node');
  PhonePeSDK = null;
}

// PhonePe Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID || 'TEST_CLIENT_ID',
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || 'TEST_CLIENT_SECRET',
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1,
  environment: process.env.PHONEPE_ENV || 'SANDBOX'
};

// Generate unique transaction IDs
const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMerchantTransactionId = () => `MTXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize PhonePe client
let phonePeClient = null;
const getPhonePeClient = () => {
  if (!phonePeClient && PhonePeSDK) {
    try {
      const env = PHONEPE_CONFIG.environment === 'PRODUCTION' 
        ? PhonePeSDK.Env.PRODUCTION 
        : PhonePeSDK.Env.SANDBOX;
      
      phonePeClient = PhonePeSDK.StandardCheckoutClient.getInstance(
        PHONEPE_CONFIG.clientId,
        PHONEPE_CONFIG.clientSecret,
        PHONEPE_CONFIG.clientVersion,
        env
      );
      
      console.log(`✅ PhonePe client initialized for ${PHONEPE_CONFIG.environment}`);
    } catch (error) {
      console.error('❌ Failed to initialize PhonePe client:', error.message);
    }
  }
  return phonePeClient;
};

// Set to track pending verifications
const pendingVerifications = new Set();
const pendingNotifications = new Set();

// Function to send successful payment notification
// controllers/paymentController.js - Update the notification function
const sendSuccessfulPaymentNotification = async (order, transaction) => {
  const notificationKey = `notify_${transaction.transactionId}`;
  
  console.log(`📨 Attempting notification for transaction: ${transaction.transactionId}`);
  console.log(`   Order ID: ${order.id}, Amount: ${transaction.amount}`);
  
  if (pendingNotifications.has(notificationKey)) {
    console.log(`⚠️ Notification already being processed for ${transaction.transactionId}`);
    return false;
  }

  try {
    pendingNotifications.add(notificationKey);
    
    // Check if Telegram is ready
    if (!telegramService.isReady) {
      console.error('❌ Telegram service not ready');
      await telegramService.init(); // Try to initialize
      
      if (!telegramService.isReady) {
        console.error('❌ Telegram initialization failed');
        return false;
      }
    }
    
    // Check database flag
    const freshTransaction = await Transaction.findByPk(transaction.id);
    if (freshTransaction.telegramNotificationSent) {
      console.log(`✅ Telegram notification already sent for ${transaction.transactionId}`);
      return true;
    }
    
    // IMPORTANT: Fetch order with Customer included
    const orderWithCustomer = await Order.findByPk(order.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'phone', 'address'] // Explicitly include these fields
        }
      ]
    });
    
    if (!orderWithCustomer) {
      console.error(`❌ Order ${order.id} not found`);
      return false;
    }
    
    // Get customer data from the included relationship
    let customerName = 'Not specified';
    let customerPhone = 'Not specified';
    let customerAddress = 'Not specified';
    
    if (orderWithCustomer.Customer) {
      customerName = orderWithCustomer.Customer.name || 'Not specified';
      customerPhone = orderWithCustomer.Customer.phone || 'Not specified';
      customerAddress = orderWithCustomer.Customer.address || 'Not specified';
    }
    
    // Add customer info to order object for the formatter
    orderWithCustomer.name = customerName;
    orderWithCustomer.phone = customerPhone;
    orderWithCustomer.address = customerAddress;
    
    // If products data is stored as JSON string, parse it
    let productsData = [];
    try {
      if (typeof orderWithCustomer.products === 'string') {
        productsData = JSON.parse(orderWithCustomer.products);
      } else if (Array.isArray(orderWithCustomer.products)) {
        productsData = orderWithCustomer.products;
      }
      
      // Add products to order object for formatting
      orderWithCustomer.products = productsData;
    } catch (parseError) {
      console.error('❌ Error parsing products:', parseError);
    }
    
    // Format message
    const message = telegramService.formatPaymentSuccess(orderWithCustomer, transaction);
    console.log(`📝 Formatted message length: ${message.length} characters`);
    console.log(`👤 Customer Name: ${customerName}`);
    console.log(`📱 Customer Phone: ${customerPhone}`);
    console.log(`📍 Customer Address: ${customerAddress}`);
    
    // Send notification
    const sent = await telegramService.sendMessage(message);
    
    if (sent) {
      // Update database flag
      await freshTransaction.update({
        telegramNotificationSent: true,
        telegramSentAt: new Date()
      });
      
      console.log(`✅ Payment notification sent to Telegram for ${transaction.transactionId}`);
      return true;
    } else {
      console.error(`❌ Failed to send Telegram message for ${transaction.transactionId}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to send payment notification:', error);
    console.error('Stack trace:', error.stack);
    
    // Don't reset flag on error - we want to retry
    return false;
  } finally {
    pendingNotifications.delete(notificationKey);
  }
};
// Check if PhonePe is configured
export const checkPhonePeConfig = async (req, res) => {
  try {
    const isSDKLoaded = !!PhonePeSDK;
    const hasClientId = !!PHONEPE_CONFIG.clientId && PHONEPE_CONFIG.clientId !== 'TEST_CLIENT_ID';
    const hasClientSecret = !!PHONEPE_CONFIG.clientSecret && PHONEPE_CONFIG.clientSecret !== 'TEST_CLIENT_SECRET';
    
    const configStatus = {
      sdkLoaded: isSDKLoaded,
      clientId: hasClientId ? 'Configured' : 'Missing',
      clientSecret: hasClientSecret ? 'Configured' : 'Missing',
      environment: PHONEPE_CONFIG.environment,
      clientVersion: PHONEPE_CONFIG.clientVersion,
      telegramConfigured: telegramService.initialized
    };
    
    if (!isSDKLoaded || !hasClientId || !hasClientSecret) {
      return res.status(200).json({
        success: false,
        message: "PhonePe configuration incomplete",
        config: configStatus,
        instructions: [
          "1. Install SDK: npm install pg-sdk-node",
          "2. Get credentials from PhonePe Dashboard → Developer Settings",
          "3. Add to .env file:",
          "   PHONEPE_CLIENT_ID=your_client_id",
          "   PHONEPE_CLIENT_SECRET=your_client_secret",
          "   PHONEPE_CLIENT_VERSION=1",
          "   PHONEPE_ENV=SANDBOX"
        ]
      });
    }
    
    const client = getPhonePeClient();
    if (!client) {
      throw new Error("Failed to create PhonePe client");
    }
    
    res.status(200).json({
      success: true,
      message: "PhonePe is configured correctly",
      config: configStatus,
      status: "Ready for testing"
    });
    
  } catch (error) {
    console.error("Config check error:", error);
    res.status(500).json({
      success: false,
      message: "PhonePe configuration error",
      error: error.message,
      config: {
        clientId: PHONEPE_CONFIG.clientId ? 'Present' : 'Missing',
        clientSecret: PHONEPE_CONFIG.clientSecret ? 'Present' : 'Missing',
        sdk: PhonePeSDK ? 'Loaded' : 'Not loaded'
      }
    });
  }
};

// Initiate PhonePe Payment
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, customerPhone, customerEmail } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: "Order ID and amount are required" 
      });
    }

    if (!PhonePeSDK) {
      return res.status(500).json({
        success: false,
        message: "PhonePe SDK not loaded",
        instructions: "Run: npm install pg-sdk-node"
      });
    }

    const client = getPhonePeClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Failed to initialize PhonePe client",
        error: "Check your credentials in .env file"
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    if (order.paymentStatus === "paid" || order.paymentStatus === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Order is already paid" 
      });
    }

    const transactionId = generateTransactionId();
    const merchantTransactionId = generateMerchantTransactionId();

    const transaction = await Transaction.create({
      orderId: order.id,
      transactionId: transactionId,
      merchantTransactionId: merchantTransactionId,
      amount: amount,
      paymentStatus: "PENDING",
      paymentGateway: "PHONEPE",
      telegramNotificationSent: false
    });

    await order.update({
      paymentMethod: "phonepay",
      transactionId: transactionId,
      paymentStatus: "pending"
    });

    const metaInfo = PhonePeSDK.MetaInfo.builder()
      .udf1(order.name || 'Customer')
      .udf2(order.phone || customerPhone || '')
      .udf3(order.email || customerEmail || '')
      .build();

    const request = PhonePeSDK.StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantTransactionId)
      .amount(amount * 100)
      .redirectUrl(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?order=${orderId}&transaction=${transactionId}`)
      .metaInfo(metaInfo)
      .build();

    console.log('📤 Initiating PhonePe payment:', {
      orderId,
      merchantTransactionId,
      amount,
      environment: PHONEPE_CONFIG.environment
    });

    const response = await client.pay(request);

    if (!response.redirectUrl) {
      throw new Error('Payment URL not received from PhonePe');
    }

    await transaction.update({
      redirectUrl: response.redirectUrl,
      gatewayResponse: response
    });

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        paymentUrl: response.redirectUrl,
        transactionId: transactionId,
        merchantTransactionId: merchantTransactionId,
        orderId: order.id,
        amount: amount,
        state: response.state || 'PENDING',
        testInfo: {
          sandboxPhone: "9999999999",
          sandboxOTP: "789456",
          testCards: [
            { card: "4111 1111 1111 1111", expiry: "12/30", cvv: "123" }
          ]
        }
      }
    });

  } catch (error) {
    console.error("❌ Payment initiation error:", error);
    
    let errorMessage = "Failed to initiate payment";
    let errorDetails = {};
    
    if (error.code) {
      errorMessage = `PhonePe Error [${error.code}]: ${error.message}`;
    } else if (error.message.includes('CLIENT_ID') || error.message.includes('CLIENT_SECRET')) {
      errorMessage = "Invalid PhonePe credentials";
      errorDetails = {
        issue: "Credentials mismatch",
        check: "Verify .env file has correct credentials"
      };
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = "Network error connecting to PhonePe";
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage, 
      error: error.message,
      details: errorDetails
    });
  }
};

// Check Payment Status
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
          amount: transaction.amount,
          paymentStatus: transaction.paymentStatus,
          telegramNotificationSent: transaction.telegramNotificationSent,
          redirectUrl: transaction.redirectUrl,
          createdAt: transaction.createdAt
        },
        order: transaction.Order ? {
          id: transaction.Order.id,
          totalPrice: transaction.Order.totalPrice,
          paymentStatus: transaction.Order.paymentStatus,
          paymentMethod: transaction.Order.paymentMethod
        } : null
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

// Update the verifyPayment function - Fix the notification sending logic
export const verifyPayment = async (req, res) => {
  let verificationKey = null;
  
  try {
    const { orderId, transactionId } = req.body;
    
    if (!orderId && !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Either orderId or transactionId is required"
      });
    }
    
    verificationKey = transactionId || `order_${orderId}`;
    
    if (pendingVerifications.has(verificationKey)) {
      return res.status(200).json({
        success: true,
        message: "Verification already in progress",
        inProgress: true
      });
    }
    
    pendingVerifications.add(verificationKey);
    
    let transaction;
    let whereClause = {};
    
    if (transactionId) {
      whereClause.transactionId = transactionId;
    } else if (orderId) {
      whereClause.orderId = orderId;
    }
    
    // Get the most recent transaction for this order
    transaction = await Transaction.findOne({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Order,
        include: [Customer]
      }]
    });
    
    if (!transaction) {
      pendingVerifications.delete(verificationKey);
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    // If already successful, just return
    if (transaction.paymentStatus === "SUCCESS") {
      pendingVerifications.delete(verificationKey);
      
      // Check if notification was sent
      if (!transaction.telegramNotificationSent && transaction.Order) {
        await sendSuccessfulPaymentNotification(transaction.Order, transaction);
      }
      
      return res.status(200).json({
        success: true,
        data: {
          transaction: {
            id: transaction.id,
            transactionId: transaction.transactionId,
            merchantTransactionId: transaction.merchantTransactionId,
            amount: transaction.amount,
            paymentStatus: transaction.paymentStatus,
            telegramNotificationSent: transaction.telegramNotificationSent
          }
        }
      });
    }
    
    // Only check PhonePe if status is pending
    if (transaction.paymentStatus === "PENDING" && transaction.merchantTransactionId) {
      try {
        const client = getPhonePeClient();
        if (client) {
          const statusResponse = await client.getOrderStatus(transaction.merchantTransactionId);
          
          console.log('📊 PhonePe Status Response:', JSON.stringify(statusResponse, null, 2));
          
          if (statusResponse.state === "COMPLETED" || statusResponse.state === "PAYMENT_SUCCESS") {
            // Update transaction status
            await transaction.update({
              paymentStatus: "SUCCESS",
              gatewayResponse: statusResponse
            });
            
            // Update order status
            if (transaction.Order) {
              await transaction.Order.update({
                paymentStatus: "paid",
                updatedAt: new Date()
              });
            }
            
          } else if (statusResponse.state === "FAILED" || statusResponse.state === "PAYMENT_ERROR") {
            await transaction.update({
              paymentStatus: "FAILED",
              gatewayResponse: statusResponse
            });
            
            if (transaction.Order) {
              await transaction.Order.update({
                paymentStatus: "failed",
                updatedAt: new Date()
              });
            }
          }
          
          // Refresh transaction data
          await transaction.reload();
        }
      } catch (statusError) {
        console.error("❌ PhonePe status check failed:", statusError.message);
      }
    }
    
    // Send notification if payment succeeded
    if (transaction.paymentStatus === "SUCCESS" && transaction.Order) {
      if (!transaction.telegramNotificationSent) {
        console.log('🔔 Attempting to send Telegram notification...');
        const notificationSent = await sendSuccessfulPaymentNotification(transaction.Order, transaction);
        
        if (notificationSent) {
          console.log('✅ Telegram notification sent successfully');
        } else {
          console.log('❌ Failed to send Telegram notification');
        }
      } else {
        console.log('ℹ️ Telegram notification already sent');
      }
    }
    
    // Get final updated transaction
    const finalTransaction = await Transaction.findByPk(transaction.id, {
      include: [Order]
    });
    
    res.status(200).json({
      success: true,
      data: {
        transaction: {
          id: finalTransaction.id,
          transactionId: finalTransaction.transactionId,
          merchantTransactionId: finalTransaction.merchantTransactionId,
          amount: finalTransaction.amount,
          paymentStatus: finalTransaction.paymentStatus,
          telegramNotificationSent: finalTransaction.telegramNotificationSent,
          notificationStatus: finalTransaction.telegramNotificationSent ? 'sent' : 'pending'
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  } finally {
    if (verificationKey) {
      pendingVerifications.delete(verificationKey);
    }
  }
};

// Mock Payment Callback
export const paymentCallback = async (req, res) => {
  console.log('📥 Mock PhonePe Callback (For Testing)');
  
  res.status(200).json({
    success: true,
    message: "Callback received (Testing Mode)",
    note: "In production, PhonePe will send real webhooks here"
  });
};

// Manual Payment Status Update
export const updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    
    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and status are required"
      });
    }
    
    const validStatuses = ['SUCCESS', 'FAILED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
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
    
    await transaction.update({
      paymentStatus: status,
      updatedAt: new Date()
    });
    
    if (transaction.Order) {
      const orderStatus = status === 'SUCCESS' ? 'paid' : 
                         status === 'FAILED' ? 'failed' : 'pending';
      
      await transaction.Order.update({
        paymentStatus: orderStatus,
        updatedAt: new Date()
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: {
        transactionId,
        newStatus: status,
        orderId: transaction.Order?.id
      }
    });
    
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
};

// Test Payment
export const testPayment = async (req, res) => {
  try {
    const { amount = 100, orderId = 'TEST_ORDER' } = req.body;
    
    const transactionId = generateTransactionId();
    const merchantTransactionId = generateMerchantTransactionId();
    
    const mockPaymentUrl = PHONEPE_CONFIG.environment === 'SANDBOX'
      ? 'https://sandbox.phonepe.com/test-payment'
      : 'https://phonepe.com/payment';
    
    res.status(200).json({
      success: true,
      message: "Test payment initiated",
      data: {
        paymentUrl: mockPaymentUrl,
        transactionId,
        merchantTransactionId,
        orderId,
        amount,
        state: 'PENDING',
        testInstructions: {
          sandbox: "Use sandbox mode for testing",
          phone: "9999999999",
          otp: "789456",
          cards: [
            { number: "4111 1111 1111 1111", expiry: "12/30", cvv: "123" }
          ]
        }
      }
    });
    
  } catch (error) {
    console.error("Test payment error:", error);
    res.status(500).json({
      success: false,
      message: "Test payment failed",
      error: error.message
    });
  }
};

export const testTelegram = async (req, res) => {
  try {
    if (!telegramService.isReady) {
      return res.status(400).json({
        success: false,
        message: "Telegram bot is not configured. Check your .env file"
      });
    }
    
    const sent = await telegramService.sendTestMessage();
    
    if (sent) {
      res.status(200).json({
        success: true,
        message: "Test notification sent to Telegram!"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test notification"
      });
    }
    
  } catch (error) {
    console.error("Test Telegram error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Resend notification
export const resendNotification = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }
    
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
    
    if (transaction.paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Cannot send notification for non-successful payment"
      });
    }
    
    if (!transaction.Order) {
      return res.status(400).json({
        success: false,
        message: "Order not found for this transaction"
      });
    }
    
    await transaction.update({
      telegramNotificationSent: false
    });
    
    const result = await sendSuccessfulPaymentNotification(transaction.Order, transaction);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: "Notification resent successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend notification"
      });
    }
    
  } catch (error) {
    console.error("Resend notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend notification",
      error: error.message
    });
  }
};