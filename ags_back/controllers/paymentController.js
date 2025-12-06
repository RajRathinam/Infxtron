// controllers/paymentController.js
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";

// Try to load PhonePe SDK
let PhonePeSDK;
try {
  // For ES modules, use import() function
  const sdkModule = await import('pg-sdk-node');
  PhonePeSDK = sdkModule.default || sdkModule;
  console.log('✅ PhonePe SDK loaded successfully');
} catch (error) {
  console.error('❌ Failed to load PhonePe SDK:', error.message);
  console.log('💡 Run: npm install pg-sdk-node');
  PhonePeSDK = null;
}

// PhonePe Configuration - Simplified for testing
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
      clientVersion: PHONEPE_CONFIG.clientVersion
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
    
    // Try to create client to test credentials
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

// Initiate PhonePe Payment (Testing Version)
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, customerPhone, customerEmail } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: "Order ID and amount are required" 
      });
    }

    // Check if SDK is loaded
    if (!PhonePeSDK) {
      return res.status(500).json({
        success: false,
        message: "PhonePe SDK not loaded",
        instructions: "Run: npm install pg-sdk-node"
      });
    }

    // Get PhonePe client
    const client = getPhonePeClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Failed to initialize PhonePe client",
        error: "Check your credentials in .env file"
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

    // Create transaction record
    const transaction = await Transaction.create({
      orderId: order.id,
      transactionId: transactionId,
      merchantTransactionId: merchantTransactionId,
      amount: amount,
      paymentStatus: "PENDING",
      paymentGateway: "PHONEPE"
    });

    // Update order
    await order.update({
      paymentMethod: "phonepay",
      transactionId: transactionId,
      paymentStatus: "pending"
    });

    // Prepare metadata
    const metaInfo = PhonePeSDK.MetaInfo.builder()
      .udf1(order.name || 'Customer')
      .udf2(order.phone || customerPhone || '')
      .udf3(order.email || customerEmail || '')
      .build();

    // Create payment request
    const request = PhonePeSDK.StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantTransactionId)
      .amount(amount * 100) // Convert to paise
      .redirectUrl(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?order=${orderId}&transaction=${transactionId}`)
      .metaInfo(metaInfo)
      .build();

    console.log('📤 Initiating PhonePe payment:', {
      orderId,
      merchantTransactionId,
      amount,
      environment: PHONEPE_CONFIG.environment
    });

    // Call PhonePe SDK
    const response = await client.pay(request);

    console.log('PhonePe API Response:', response);

    if (!response.redirectUrl) {
      throw new Error('Payment URL not received from PhonePe');
    }

    // Update transaction
    await transaction.update({
      redirectUrl: response.redirectUrl,
      gatewayResponse: response
    });

    console.log('✅ Payment initiated successfully');

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
        // For testing - also return mock data
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
    
    // Return detailed error for debugging
    let errorMessage = "Failed to initiate payment";
    let errorDetails = {};
    
    if (error.code) {
      errorMessage = `PhonePe Error [${error.code}]: ${error.message}`;
    } else if (error.message.includes('CLIENT_ID') || error.message.includes('CLIENT_SECRET')) {
      errorMessage = "Invalid PhonePe credentials";
      errorDetails = {
        issue: "Credentials mismatch",
        check: "Verify .env file has correct credentials",
        where: "PhonePe Dashboard → Developer Settings"
      };
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = "Network error connecting to PhonePe";
      errorDetails = {
        issue: "Network connectivity",
        check: "Check internet connection and firewall"
      };
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage, 
      error: error.message,
      details: errorDetails,
      debug: {
        clientId: PHONEPE_CONFIG.clientId ? 'Present' : 'Missing',
        environment: PHONEPE_CONFIG.environment,
        sdkLoaded: !!PhonePeSDK
      }
    });
  }
};

// Mock Payment Callback for Testing (No webhook needed)
export const paymentCallback = async (req, res) => {
  console.log('📥 Mock PhonePe Callback (For Testing)');
  console.log('Body:', req.body);
  
  // For testing, accept any callback
  res.status(200).json({
    success: true,
    message: "Callback received (Testing Mode)",
    note: "In production, PhonePe will send real webhooks here"
  });
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

// Manual Payment Status Update (For Testing)
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
    
    // Update transaction
    await transaction.update({
      paymentStatus: status,
      updatedAt: new Date()
    });
    
    // Update order
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

// Test Endpoint - Simulate PhonePe Response
export const testPayment = async (req, res) => {
  try {
    const { amount = 100, orderId = 'TEST_ORDER' } = req.body;
    
    // Generate mock response
    const transactionId = generateTransactionId();
    const merchantTransactionId = generateMerchantTransactionId();
    
    // Mock PhonePe sandbox URL
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