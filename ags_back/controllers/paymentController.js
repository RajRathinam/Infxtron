import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";

// PhonePe SDK - We'll lazy load it since it might not be installed
let PhonePeSDK = null;
const loadPhonePeSDK = async () => {
  if (!PhonePeSDK) {
    try {
      const sdkModule = await import('pg-sdk-node');
      PhonePeSDK = sdkModule.default || sdkModule;
      console.log('✅ PhonePe SDK loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load PhonePe SDK:', error.message);
      throw new Error('PhonePe SDK not installed. Run: npm install pg-sdk-node');
    }
  }
  return PhonePeSDK;
};

// PhonePe Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1,
  environment: process.env.PHONEPE_ENV || 'SANDBOX',
  // Webhook Basic Auth credentials (from PhonePe dashboard)
  webhookUsername: process.env.WEBHOOK_USERNAME || 'raj123',
  webhookPassword: process.env.WEBHOOK_PASSWORD || 'raj12345'
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
};

// Generate unique transaction IDs
const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMerchantTransactionId = () => `MTXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Verify Basic Authentication for webhooks
const verifyBasicAuth = (authHeader) => {
  try {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }
    
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    return username === PHONEPE_CONFIG.webhookUsername && 
           password === PHONEPE_CONFIG.webhookPassword;
  } catch (error) {
    console.error('Basic Auth verification error:', error);
    return false;
  }
};

// Initialize PhonePe client (singleton)
let phonePeClient = null;
const getPhonePeClient = async () => {
  if (!phonePeClient) {
    validatePhonePeConfig();
    const SDK = await loadPhonePeSDK();
    
    const env = PHONEPE_CONFIG.environment === 'PRODUCTION' 
      ? SDK.Env.PRODUCTION 
      : SDK.Env.SANDBOX;
    
    phonePeClient = SDK.StandardCheckoutClient.getInstance(
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
    const client = await getPhonePeClient();

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
    const SDK = await loadPhonePeSDK();
    const metaInfo = SDK.MetaInfo.builder()
      .udf1(order.Customer?.name || 'Customer')
      .udf2(order.Customer?.phone || customerPhone || '')
      .udf3(order.Customer?.email || customerEmail || '')
      .build();

    // Create payment request using SDK
    const request = SDK.StandardCheckoutPayRequest.builder()
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
        const client = await getPhonePeClient();
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

// 🔒 Payment Callback Handler with BASIC AUTHENTICATION
export const paymentCallback = async (req, res) => {
  console.log('\n📥 ========== PHONEPE WEBHOOK RECEIVED ==========');
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // 🔐 STEP 1: VERIFY BASIC AUTHENTICATION (PhonePe sends this)
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      console.error('❌ MISSING Authorization header - PhonePe should send Basic Auth');
      return res.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Authorization header is required"
      });
    }
    
    // Verify Basic Auth
    const isAuthenticated = verifyBasicAuth(authHeader);
    if (!isAuthenticated) {
      console.error('❌ INVALID Basic Authentication credentials');
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid webhook credentials"
      });
    }
    
    console.log('✅ BASIC AUTH VERIFIED SUCCESSFULLY');
    
    // 📋 STEP 2: PARSE WEBHOOK DATA
    const webhookData = req.body;
    
    if (!webhookData) {
      console.error('❌ EMPTY WEBHOOK BODY');
      return res.status(400).json({
        success: false,
        code: "EMPTY_BODY",
        message: "Webhook body is empty"
      });
    }
    
    // Extract event information
    const eventType = webhookData.type || 'UNKNOWN_EVENT';
    const payload = webhookData.payload || webhookData.response || webhookData;
    
    console.log(`🎯 Event Type: ${eventType}`);
    console.log('📊 Payload:', JSON.stringify(payload, null, 2));
    
    // Extract transaction details
    const merchantTransactionId = 
      payload.originalMerchantOrderId || 
      payload.merchantTransactionId || 
      payload.merchantOrderId;
    
    const transactionId = payload.transactionId;
    const state = payload.state || payload.status;
    const amount = payload.amount;
    
    if (!merchantTransactionId) {
      console.error('❌ NO MERCHANT TRANSACTION ID FOUND');
      console.log('Available payload keys:', Object.keys(payload));
      return res.status(200).json({
        success: true,
        code: "NO_TRANSACTION_ID",
        message: "Received but no transaction ID found"
      });
    }
    
    console.log(`💳 Processing: ${merchantTransactionId}`);
    console.log(`📈 Status: ${state}, Amount: ${amount}, Txn ID: ${transactionId}`);
    
    // 📋 STEP 3: FIND TRANSACTION IN DATABASE
    const transaction = await Transaction.findOne({
      where: { merchantTransactionId },
      include: [Order]
    });
    
    if (!transaction) {
      console.error(`❌ TRANSACTION NOT FOUND: ${merchantTransactionId}`);
      return res.status(200).json({
        success: true,
        code: "TRANSACTION_NOT_FOUND",
        message: "Transaction not found in database"
      });
    }
    
    // 🎯 STEP 4: MAP STATUS AND UPDATE DATABASE
    let dbPaymentStatus = "PENDING";
    let orderPaymentStatus = "pending";
    let eventDescription = "Payment pending";
    
    switch (eventType) {
      case "CHECKOUT_ORDER_COMPLETED":
        if (state === "COMPLETED") {
          dbPaymentStatus = "SUCCESS";
          orderPaymentStatus = "paid";
          eventDescription = "Payment completed successfully";
        }
        break;
        
      case "CHECKOUT_ORDER_FAILED":
        dbPaymentStatus = "FAILED";
        orderPaymentStatus = "failed";
        eventDescription = "Payment failed";
        break;
        
      case "CHECKOUT_ORDER_PENDING":
        dbPaymentStatus = "PENDING";
        orderPaymentStatus = "pending";
        eventDescription = "Payment pending";
        break;
        
      case "CHECKOUT_ORDER_ABANDONED":
        dbPaymentStatus = "ABANDONED";
        orderPaymentStatus = "pending";
        eventDescription = "Payment abandoned by user";
        break;
        
      case "PG_REFUND_COMPLETED":
        dbPaymentStatus = "REFUNDED";
        orderPaymentStatus = "refunded";
        eventDescription = "Refund completed";
        break;
        
      default:
        // Handle generic states
        if (state === "COMPLETED") {
          dbPaymentStatus = "SUCCESS";
          orderPaymentStatus = "paid";
          eventDescription = `Payment completed (${eventType})`;
        } else if (state === "FAILED") {
          dbPaymentStatus = "FAILED";
          orderPaymentStatus = "failed";
          eventDescription = `Payment failed (${eventType})`;
        } else {
          dbPaymentStatus = "PENDING";
          orderPaymentStatus = "pending";
          eventDescription = `Payment ${state} (${eventType})`;
        }
    }
    
    // Update transaction
    await transaction.update({
      paymentStatus: dbPaymentStatus,
      callbackData: webhookData,
      gatewayTransactionId: transactionId,
      updatedAt: new Date(),
      eventDescription: eventDescription,
      lastWebhookEvent: eventType
    });
    
    // Update order
    if (transaction.Order) {
      await transaction.Order.update({
        paymentStatus: orderPaymentStatus,
        transactionId: transactionId,
        updatedAt: new Date(),
        paymentNotes: `${eventType}: ${eventDescription}`
      });
    }
    
    console.log(`✅ Updated transaction ${merchantTransactionId} to ${dbPaymentStatus}`);
    console.log(`📝 Description: ${eventDescription}`);
    
    // Log for auditing
    console.log('📋 Webhook Processing Summary:', {
      eventType,
      merchantTransactionId,
      transactionId,
      amount,
      oldStatus: transaction.paymentStatus,
      newStatus: dbPaymentStatus,
      orderId: transaction.Order?.id,
      timestamp: new Date().toISOString()
    });
    
    // ✅ STEP 5: RETURN SUCCESS TO PHONEPE
    res.status(200).json({
      success: true,
      code: "WEBHOOK_PROCESSED",
      message: "Webhook processed successfully",
      timestamp: new Date().toISOString(),
      processedEvent: eventType,
      transactionStatus: dbPaymentStatus
    });
    
  } catch (error) {
    console.error("❌ Payment callback error:", error);
    console.error("Error stack:", error.stack);
    
    // Still return 200 to prevent PhonePe from retrying excessively
    res.status(200).json({ 
      success: false,
      message: "Webhook processed with errors",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Check PhonePe Configuration
export const checkPhonePeConfig = async (req, res) => {
  try {
    validatePhonePeConfig();
    const client = await getPhonePeClient();
    
    res.status(200).json({
      success: true,
      message: "PhonePe configuration is valid",
      config: {
        clientId: PHONEPE_CONFIG.clientId ? 'Configured' : 'Not configured',
        clientSecret: PHONEPE_CONFIG.clientSecret ? 'Configured' : 'Not configured',
        webhookUsername: PHONEPE_CONFIG.webhookUsername ? 'Configured' : 'Not configured',
        clientVersion: PHONEPE_CONFIG.clientVersion,
        environment: PHONEPE_CONFIG.environment,
        sdk: PhonePeSDK ? 'Available' : 'Not available'
      },
      webhookInfo: {
        url: `${process.env.BACKEND_URL || 'https://yourdomain.com'}/api/payments/callback`,
        authType: "Basic Authentication",
        username: PHONEPE_CONFIG.webhookUsername,
        activeEvents: [
          "CHECKOUT_ORDER_COMPLETED",
          "CHECKOUT_ORDER_FAILED", 
          "CHECKOUT_ORDER_PENDING",
          "CHECKOUT_ORDER_ABANDONED",
          "PG_REFUND_COMPLETED"
        ]
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
        "   WEBHOOK_USERNAME=raj123",
        "   WEBHOOK_PASSWORD=raj12345",
        "5. Set webhook in PhonePe dashboard with:",
        "   URL: https://agshealthyfoods.in/api/payments/callback",
        "   Username: raj123",
        "   Password: raj12345"
      ]
    });
  }
};

// Test Webhook Endpoint
export const testWebhook = async (req, res) => {
  try {
    console.log('🔧 Webhook test endpoint called');
    
    res.status(200).json({
      success: true,
      message: "Webhook endpoint is active and ready",
      endpoint: {
        url: "/api/payments/callback",
        method: "POST",
        authentication: "Basic Authentication Required",
        expectedCredentials: {
          username: PHONEPE_CONFIG.webhookUsername,
          password: PHONEPE_CONFIG.webhookPassword
        },
        sampleHeaders: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(`${PHONEPE_CONFIG.webhookUsername}:${PHONEPE_CONFIG.webhookPassword}`).toString('base64')
        },
        samplePayload: {
          type: "CHECKOUT_ORDER_COMPLETED",
          payload: {
            originalMerchantOrderId: "MTXN_123456789",
            transactionId: "TXN_987654321",
            state: "COMPLETED",
            amount: 10000,
            currency: "INR"
          }
        }
      },
      instructions: [
        "1. Configure in PhonePe dashboard with:",
        `   URL: ${process.env.BACKEND_URL || 'https://yourdomain.com'}/api/payments/callback`,
        `   Username: ${PHONEPE_CONFIG.webhookUsername}`,
        `   Password: ${PHONEPE_CONFIG.webhookPassword}`,
        "2. Select active events: CHECKOUT_ORDER_COMPLETED, CHECKOUT_ORDER_FAILED, etc.",
        "3. Save and test webhook from PhonePe dashboard"
      ]
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