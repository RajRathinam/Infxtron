import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";

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
  environment: process.env.PHONEPE_ENV || 'SANDBOX'
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

// Payment Callback Handler (For PhonePe webhooks/callbacks)
export const paymentCallback = async (req, res) => {
  try {
    const client = getPhonePeClient();
    
    // Get webhook credentials from environment
    const username = process.env.WEBHOOK_USERNAME;
    const password = process.env.WEBHOOK_PASSWORD;
    const authorization = req.headers['authorization'];
    const responseBody = JSON.stringify(req.body);
    
    console.log('📥 PhonePe Webhook Received');
    console.log('Event Type:', req.body.type);
    
    // Validate webhook signature if authorization header exists
    let callbackResponse;
    if (authorization) {
      callbackResponse = client.validateCallback(
        username,
        password,
        authorization,
        responseBody
      );
      console.log('✅ Webhook validated successfully');
    } else {
      // If no authorization, trust the callback (for testing)
      callbackResponse = {
        type: req.body.type,
        payload: req.body.payload
      };
      console.log('⚠️ No authorization header, using direct data');
    }
    
    const { type, payload } = callbackResponse;
    const { orderId, originalMerchantOrderId, state, amount } = payload;
    
    // Find transaction by merchantTransactionId
    const transaction = await Transaction.findOne({
      where: { merchantTransactionId: originalMerchantOrderId },
      include: [Order]
    });
    
    if (!transaction) {
      console.error('Transaction not found:', originalMerchantOrderId);
      return res.status(200).json({ success: true, message: "Webhook received but transaction not found" });
    }
    
    // Update transaction status
    let paymentStatus = "PENDING";
    let orderPaymentStatus = "pending";
    
    if (type === "CHECKOUT_ORDER_COMPLETED" || state === "COMPLETED") {
      paymentStatus = "SUCCESS";
      orderPaymentStatus = "paid";
    } else if (type === "CHECKOUT_ORDER_FAILED" || state === "FAILED") {
      paymentStatus = "FAILED";
      orderPaymentStatus = "failed";
    } else if (type === "PG_REFUND_COMPLETED") {
      paymentStatus = "REFUNDED";
      orderPaymentStatus = "refunded";
    }
    
    // Update transaction
    await transaction.update({
      paymentStatus: paymentStatus,
      callbackData: req.body
    });
    
    // Update order
    if (transaction.Order) {
      await transaction.Order.update({
        paymentStatus: orderPaymentStatus
      });
    }
    
    console.log(`✅ Updated transaction ${originalMerchantOrderId} to ${paymentStatus}`);
    
    // Return success to PhonePe
    res.status(200).json({
      success: true,
      code: "PAYMENT_SUCCESS",
      message: "Payment processed successfully"
    });
    
  } catch (error) {
    console.error("❌ Payment callback error:", error);
    
    // Still return 200 to prevent retries
    res.status(200).json({ 
      success: false,
      message: "Callback processed with errors",
      error: error.message 
    });
  }
};

// Check PhonePe Configuration
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
        clientVersion: PHONEPE_CONFIG.clientVersion,
        environment: PHONEPE_CONFIG.environment,
        sdk: PhonePeSDK ? 'Available' : 'Not available'
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
        "4. Update .env file with your credentials"
      ]
    });
  }
};

// Refund Payment (Optional - if needed)
export const initiateRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;
    
    // Get PhonePe client
    const client = getPhonePeClient();
    
    // Find order and transaction
    const order = await Order.findByPk(orderId, {
      include: [{
        model: Transaction,
        where: { paymentStatus: "SUCCESS" },
        required: false
      }]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (!order.Transactions || order.Transactions.length === 0) {
      return res.status(400).json({ success: false, message: "No successful transaction found" });
    }
    
    const transaction = order.Transactions[0];
    
    // Create refund request
    const refundRequest = PhonePeSDK.RefundRequest.builder()
      .merchantRefundId(`REFUND_${Date.now()}`)
      .originalMerchantOrderId(transaction.merchantTransactionId)
      .amount(amount * 100) // Convert to paise
      .build();
    
    // Initiate refund
    const refundResponse = await client.refund(refundRequest);
    
    // Create refund transaction
    await Transaction.create({
      orderId: order.id,
      transactionId: `REFUND_${Date.now()}`,
      merchantTransactionId: refundResponse.refundId,
      amount: amount,
      paymentStatus: "PENDING",
      paymentGateway: "PHONEPE_REFUND"
    });
    
    res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      data: refundResponse
    });
    
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate refund",
      error: error.message
    });
  }
};