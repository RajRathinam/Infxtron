import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto"; // Added for signature verification

// Try to import PhonePe SDK
let PhonePeSDK;
try {
  // Use dynamic import for ES modules
  const sdkModule = await import('pg-sdk-node');
  PhonePeSDK = sdkModule.default || sdkModule;
  console.log('✅ PhonePe SDK loaded successfully');
} catch (error) {
  console.error('❌ Failed to load PhonePe SDK:', error.message);
}

// PhonePe SDK Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1,
  environment: process.env.PHONEPE_ENV || 'SANDBOX',
  webhookSecret: process.env.WEBHOOK_SECRET
};

// Validate PhonePe configuration
const validatePhonePeConfig = () => {
  const missing = [];
  if (!PHONEPE_CONFIG.clientId || PHONEPE_CONFIG.clientId === 'YOUR_CLIENT_ID_HERE') {
    missing.push('PHONEPE_CLIENT_ID');
  }
  if (!PHONEPE_CONFIG.clientSecret || PHONEPE_CONFIG.clientSecret === 'YOUR_CLIENT_SECRET_HERE') {
    missing.push('PHONEPE_CLIENT_SECRET');
  }
  
  if (missing.length > 0) {
    throw new Error(`PhonePe configuration missing: ${missing.join(', ')}. Get these from PhonePe Dashboard → Developer Settings`);
  }
  
  if (!PhonePeSDK) {
    throw new Error('PhonePe SDK not installed. Run: npm install pg-sdk-node');
  }
};

// Generate unique transaction IDs
const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMerchantTransactionId = () => `MTXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 🔐 Verify PhonePe webhook signature
const verifyWebhookSignature = (payload, signature, webhookSecret) => {
  try {
    if (!webhookSecret) {
      console.warn('⚠️ WEBHOOK_SECRET not configured, skipping signature verification');
      return true; // Allow in development
    }
    
    // PhonePe signature format: sha256(payload + webhookSecret)
    const expectedSignature = crypto
      .createHash('sha256')
      .update(payload + webhookSecret)
      .digest('hex');
    
    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      console.log('Expected:', expectedSignature);
      console.log('Received:', signature);
    }
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Initialize PhonePe client (singleton)
let phonePeClient = null;
const getPhonePeClient = () => {
  if (!phonePeClient) {
    validatePhonePeConfig();
    
    const env = PHONEPE_CONFIG.environment === 'PRODUCTION' 
      ? PhonePeSDK.Env.PRODUCTION 
      : PhonePeSDK.Env.SANDBOX;
    
    phonePeClient = PhonePeSDK.StandardCheckoutClient.getInstance(
      PHONEPE_CONFIG.clientId,
      PHONEPE_CONFIG.clientSecret,
      PHONEPE_CONFIG.clientVersion,
      env
    );
    
    console.log(`✅ PhonePe SDK initialized for ${PHONEPE_CONFIG.environment} environment`);
  }
  return phonePeClient;
};

// Initiate PhonePe Payment using SDK
export const initiatePayment = async (req, res) => {
  let currentOrderId;
  
  try {
    const { orderId, amount, customerPhone, customerEmail } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: "Order ID and amount are required" 
      });
    }

    // Get PhonePe client
    const client = getPhonePeClient();

    // Find the order
    const order = await Order.findByPk(orderId, {
      include: ['Customer']
    });
    
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

    // Update order payment method and transaction ID
    await order.update({
      paymentMethod: "phonepay",
      transactionId: transactionId,
      paymentStatus: "pending"
    });

    // Prepare metadata
    const metaInfo = PhonePeSDK.MetaInfo.builder()
      .udf1(order.Customer?.name || 'Customer')
      .udf2(order.Customer?.phone || customerPhone || '')
      .udf3(order.Customer?.email || customerEmail || '')
      .build();

    // Create payment request using SDK
    const request = PhonePeSDK.StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantTransactionId)
      .amount(amount * 100) // Convert to paise
      .redirectUrl(`${process.env.FRONTEND_URL}/payment-result?order=${orderId}&transaction=${transactionId}`)
      .metaInfo(metaInfo)
      .build();

    console.log('📤 Initiating PhonePe payment for order:', orderId);

    // Call PhonePe SDK
    const response = await client.pay(request);

    if (!response.redirectUrl) {
      throw new Error('Payment URL not received from PhonePe');
    }

    // Update transaction with redirect URL
    await transaction.update({
      redirectUrl: response.redirectUrl,
      gatewayResponse: {
        request: request,
        response: response,
        orderId: order.id,
        customerName: order.Customer?.name,
        customerPhone: order.Customer?.phone
      }
    });

    console.log('✅ Payment initiated successfully for order:', orderId);

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        paymentUrl: response.redirectUrl,
        transactionId: transactionId,
        merchantTransactionId: merchantTransactionId,
        orderId: order.id,
        amount: amount,
        state: response.state || 'PENDING'
      }
    });

  } catch (error) {
    console.error("❌ Payment initiation error:", error);
    
    // Update transaction as failed
    if (currentOrderId) {
      try {
        await Transaction.update(
          { paymentStatus: "FAILED" },
          { where: { orderId: currentOrderId } }
        );
        
        await Order.update(
          { paymentStatus: "failed" },
          { where: { id: currentOrderId } }
        );
      } catch (updateError) {
        console.error("Error updating failed transaction:", updateError);
      }
    }

    // Handle PhonePe SDK specific errors
    let errorMessage = "Failed to initiate payment";
    if (error.code) {
      errorMessage = `PhonePe Error: ${error.message}`;
    } else if (error.message.includes('CLIENT_ID') || error.message.includes('CLIENT_SECRET')) {
      errorMessage = "PhonePe credentials are invalid. Please check your .env file";
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage, 
      error: error.message || 'Unknown error',
      details: "Please check your PhonePe configuration in .env file"
    });
  }
};

// Check Payment Status using SDK
export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find transaction
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

    // Try to get status from PhonePe if still pending
    if (transaction.paymentStatus === "PENDING" && transaction.merchantTransactionId) {
      try {
        const client = getPhonePeClient();
        const statusResponse = await client.getOrderStatus(transaction.merchantTransactionId);
        
        // Update based on PhonePe response
        if (statusResponse.state === "COMPLETED") {
          transaction.paymentStatus = "SUCCESS";
          if (transaction.Order) {
            transaction.Order.paymentStatus = "paid";
            await transaction.Order.save();
          }
        } else if (statusResponse.state === "FAILED") {
          transaction.paymentStatus = "FAILED";
          if (transaction.Order) {
            transaction.Order.paymentStatus = "failed";
            await transaction.Order.save();
          }
        }
        
        await transaction.save();
      } catch (statusError) {
        console.log("Could not fetch status from PhonePe:", statusError.message);
      }
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
          status: transaction.Order.status,
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

// 🔒 SECURE Payment Callback Handler (Updated with signature verification)
export const paymentCallback = async (req, res) => {
  try {
    console.log('📥 PhonePe Webhook Received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Get signature from headers
    const signature = req.headers['x-verify'] || req.headers['x-phonepe-signature'];
    const webhookSecret = PHONEPE_CONFIG.webhookSecret;
    
    // Verify webhook signature for security
    const payload = JSON.stringify(req.body);
    if (signature && webhookSecret) {
      const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ Webhook signature verification failed - Potential security threat!');
        return res.status(401).json({
          success: false,
          message: "Invalid webhook signature"
        });
      }
      console.log('✅ Webhook signature verified successfully');
    } else if (!webhookSecret) {
      console.warn('⚠️ WEBHOOK_SECRET not configured - Running in insecure mode');
    }
    
    // Parse the webhook data
    const webhookData = req.body;
    
    // Handle different webhook formats
    let eventType, merchantTransactionId, paymentStatus, transactionId;
    
    // Format 1: Standard PhonePe webhook format
    if (webhookData.type && webhookData.payload) {
      eventType = webhookData.type;
      merchantTransactionId = webhookData.payload.originalMerchantOrderId;
      transactionId = webhookData.payload.transactionId;
      paymentStatus = webhookData.payload.state;
      
      console.log(`Processing webhook: ${eventType} for ${merchantTransactionId}`);
    }
    // Format 2: Direct payment response (for pay page redirect)
    else if (webhookData.response && webhookData.response.merchantTransactionId) {
      merchantTransactionId = webhookData.response.merchantTransactionId;
      transactionId = webhookData.response.transactionId;
      paymentStatus = webhookData.response.state;
      eventType = `PAYMENT_${paymentStatus}`;
      
      console.log(`Processing payment response for ${merchantTransactionId}`);
    }
    // Format 3: Check for merchantTransactionId directly
    else if (webhookData.merchantTransactionId) {
      merchantTransactionId = webhookData.merchantTransactionId;
      transactionId = webhookData.transactionId;
      paymentStatus = webhookData.state || webhookData.status;
      eventType = webhookData.event || 'PAYMENT_UPDATE';
      
      console.log(`Processing payment update for ${merchantTransactionId}`);
    } else {
      console.error('❌ Unrecognized webhook format:', webhookData);
      return res.status(200).json({
        success: true,
        message: "Webhook received but format not recognized"
      });
    }
    
    // Find transaction by merchantTransactionId
    const transaction = await Transaction.findOne({
      where: { merchantTransactionId },
      include: [Order]
    });
    
    if (!transaction) {
      console.error('Transaction not found:', merchantTransactionId);
      return res.status(200).json({ 
        success: true, 
        message: "Webhook received but transaction not found" 
      });
    }
    
    // Map PhonePe status to our status
    let dbPaymentStatus = "PENDING";
    let orderPaymentStatus = "pending";
    
    if (paymentStatus === "COMPLETED" || eventType.includes("COMPLETED") || eventType.includes("SUCCESS")) {
      dbPaymentStatus = "SUCCESS";
      orderPaymentStatus = "paid";
    } else if (paymentStatus === "FAILED" || eventType.includes("FAILED") || eventType.includes("ERROR")) {
      dbPaymentStatus = "FAILED";
      orderPaymentStatus = "failed";
    } else if (paymentStatus === "REFUNDED" || eventType.includes("REFUND")) {
      dbPaymentStatus = "REFUNDED";
      orderPaymentStatus = "refunded";
    }
    
    // Update transaction
    await transaction.update({
      paymentStatus: dbPaymentStatus,
      callbackData: webhookData,
      gatewayTransactionId: transactionId,
      updatedAt: new Date()
    });
    
    // Update order
    if (transaction.Order) {
      await transaction.Order.update({
        paymentStatus: orderPaymentStatus,
        transactionId: transactionId,
        updatedAt: new Date()
      });
    }
    
    console.log(`✅ Updated transaction ${merchantTransactionId} to ${dbPaymentStatus}`);
    
    // Return success to PhonePe
    res.status(200).json({
      success: true,
      code: "WEBHOOK_PROCESSED",
      message: "Webhook processed successfully"
    });
    
  } catch (error) {
    console.error("❌ Payment callback error:", error);
    
    // Still return 200 to prevent PhonePe from retrying too much
    res.status(200).json({ 
      success: false,
      message: "Callback processed with errors",
      error: error.message 
    });
  }
};

// Check PhonePe Configuration (Updated)
export const checkPhonePeConfig = async (req, res) => {
  try {
    validatePhonePeConfig();
    const client = getPhonePeClient();
    
    res.status(200).json({
      success: true,
      message: "PhonePe configuration is valid",
      config: {
        clientId: PHONEPE_CONFIG.clientId ? 'Configured' : 'Not configured',
        clientSecret: PHONEPE_CONFIG.clientSecret ? 'Configured' : 'Not configured',
        webhookSecret: PHONEPE_CONFIG.webhookSecret ? 'Configured' : 'Not configured (Security Risk)',
        clientVersion: PHONEPE_CONFIG.clientVersion,
        environment: PHONEPE_CONFIG.environment,
        sdk: PhonePeSDK ? 'Available' : 'Not available'
      },
      security: {
        webhookVerification: PHONEPE_CONFIG.webhookSecret ? 'Enabled' : 'Disabled (Insecure)',
        signatureVerification: PHONEPE_CONFIG.webhookSecret ? 'Required' : 'Skipped'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PhonePe configuration error",
      error: error.message,
      instructions: [
        "1. Get credentials from PhonePe Dashboard → Developer Settings",
        "2. Toggle 'Test Mode' ON for sandbox credentials",
        "3. Install SDK: npm install pg-sdk-node",
        "4. Update .env file with:",
        "   PHONEPE_CLIENT_ID=your_client_id",
        "   PHONEPE_CLIENT_SECRET=your_client_secret",
        "   PHONEPE_WEBHOOK_SECRET=your_webhook_secret",
        "5. Set callback URL in PhonePe dashboard to:",
        "   https://yourdomain.com/api/payments/callback"
      ]
    });
  }
};

// Add a new endpoint to test webhook (for debugging)
export const testWebhook = async (req, res) => {
  try {
    // This is for testing webhook functionality
    console.log('🔧 Webhook test endpoint called');
    
    res.status(200).json({
      success: true,
      message: "Webhook endpoint is active",
      info: {
        path: "/api/payments/callback",
        method: "POST",
        requiredHeaders: ["Content-Type: application/json"],
        signatureVerification: PHONEPE_CONFIG.webhookSecret ? "Enabled" : "Disabled",
        testPayload: {
          type: "CHECKOUT_ORDER_COMPLETED",
          payload: {
            originalMerchantOrderId: "TEST_MTXN_123",
            transactionId: "TEST_TXN_456",
            state: "COMPLETED",
            amount: 10000
          }
        }
      }
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook test failed",
      error: error.message
    });
  }
};