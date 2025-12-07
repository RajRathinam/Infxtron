// controllers/transactionController.js
import Transaction from "../models/Transaction.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

// Get all transactions with order and customer details
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Order,
          include: [{
            model: Customer,
            attributes: ["id", "name", "phone", "email"]
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
    
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch transactions", 
      error: err.message 
    });
  }
};

// Get single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Order,
          include: [{
            model: Customer,
            attributes: ["id", "name", "phone", "email", "address"]
          }]
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    res.status(200).json({
      success: true,
      transaction
    });
    
  } catch (err) {
    console.error("Failed to fetch transaction:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch transaction", 
      error: err.message 
    });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    // Validate payment status
    const validStatuses = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}`
      });
    }
    
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    // Update transaction status
    transaction.paymentStatus = paymentStatus;
    await transaction.save();
    
    // Also update the associated order's payment status
    if (transaction.orderId) {
      const order = await Order.findByPk(transaction.orderId);
      if (order) {
        order.paymentStatus = paymentStatus.toLowerCase();
        await order.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Transaction status updated to ${paymentStatus}`,
      transaction
    });
    
  } catch (err) {
    console.error("Failed to update transaction status:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update transaction status", 
      error: err.message 
    });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    await transaction.destroy();
    
    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully"
    });
    
  } catch (err) {
    console.error("Failed to delete transaction:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete transaction", 
      error: err.message 
    });
  }
};