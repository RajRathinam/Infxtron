import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Customer from "./Customer.js";

const Order = sequelize.define("Order", {
  products: {
    type: DataTypes.JSONB, // store product details as JSON
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("order taken", "order shipped", "order delivered"),
    defaultValue: "order taken",
    allowNull: false,
  }
  ,  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: "cash"
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "pending" // pending, initiated, completed, failed, cancelled
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relationship: One Customer can have many Orders
Customer.hasMany(Order, { foreignKey: "customerId" });
Order.belongsTo(Customer, { foreignKey: "customerId" });

export default Order;
