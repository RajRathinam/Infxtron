import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Customer from "./Customer.js";

const Order = sequelize.define("Order", {
  products: {
    type: DataTypes.JSON,
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
  deliveryPoint: {
    type: DataTypes.ENUM("point_a", "point_b", "point_c", "home_delivery"),
    allowNull: false,
  },
  deliveryCharge: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("order taken", "order shipped", "order delivered"),
    defaultValue: "order taken",
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("whatsapp", "phonepay", "cash_on_delivery"),
    defaultValue: "whatsapp"
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  }
  // Removed duplicate paymentMethod field
});

Customer.hasMany(Order, { foreignKey: "customerId" });
Order.belongsTo(Customer, { foreignKey: "customerId" });

export default Order;