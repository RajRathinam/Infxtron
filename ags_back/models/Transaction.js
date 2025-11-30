// models/Transaction.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Order from "./Order.js";

const Transaction = sequelize.define("Transaction", {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    }
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  merchantTransactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER, // Amount in paise
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: "INR"
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      "PENDING",
      "SUCCESS", 
      "FAILED",
      "CANCELLED"
    ),
    defaultValue: "PENDING"
  },
  paymentGateway: {
    type: DataTypes.STRING,
    defaultValue: "PHONEPE"
  },
  gatewayResponse: {
    type: DataTypes.JSON, // Store complete gateway response
    allowNull: true
  },
  callbackData: {
    type: DataTypes.JSON, // Store callback data
    allowNull: true
  },
  redirectUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['transactionId']
    },
    {
      fields: ['merchantTransactionId']
    },
    {
      fields: ['orderId']
    }
  ]
});

// Associations
Order.hasMany(Transaction, { foreignKey: "orderId" });
Transaction.belongsTo(Order, { foreignKey: "orderId" });

export default Transaction;