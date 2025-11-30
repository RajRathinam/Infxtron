import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
  productName: { type: DataTypes.STRING, allowNull: false },
  packName: { type: DataTypes.STRING, allowNull: false },
  weight: { type: DataTypes.STRING, allowNull: false },
  proteinIntake: { type: DataTypes.STRING, allowNull: true },
  availableDay: { 
    type: DataTypes.TEXT, // Changed from ARRAY to TEXT for MySQL
    allowNull: true,
    get() {
      const value = this.getDataValue('availableDay');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('availableDay', value ? JSON.stringify(value) : null);
    },
    defaultValue: '[]'
  },
  availableTime: { type: DataTypes.STRING, allowNull: true },
  singleOrder: { type: DataTypes.INTEGER, allowNull: false },
  weeklySubscription: { type: DataTypes.INTEGER, allowNull: false },
  monthlySubscription: { type: DataTypes.INTEGER, allowNull: false },
  imagePath: { type: DataTypes.STRING, allowNull: false },
  ingredients: { 
    type: DataTypes.TEXT, // Changed from ARRAY to TEXT for MySQL
    allowNull: true,
    get() {
      const value = this.getDataValue('ingredients');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('ingredients', value ? JSON.stringify(value) : null);
    },
    defaultValue: '[]'
  },
  discounts: { 
    type: DataTypes.JSON, // Changed from JSONB to JSON for MySQL
    allowNull: true,
  },
  description: { type: DataTypes.TEXT, allowNull: true },
});

export default Product;