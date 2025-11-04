import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Customer = sequelize.define("Customer", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isTenDigits(value) {
        if (!/^\d{10}$/.test(value)) {
          throw new Error("Phone number must be exactly 10 digits");
        }
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // optional by default, validated in controller
    validate: {
      isEmailOrNull(value) {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
  },
  message:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  wantsOffers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Customer;
