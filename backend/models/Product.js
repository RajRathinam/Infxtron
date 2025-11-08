import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
  productName: { type: DataTypes.STRING, allowNull: false },
  packName: { type: DataTypes.STRING, allowNull: false },
  weight: { type: DataTypes.STRING, allowNull: false },
  proteinIntake: { type: DataTypes.STRING, allowNull: true },
  availableDay: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    allowNull: true,
    defaultValue: [] 
  },
  availableTime: { type: DataTypes.STRING, allowNull: true },
  singleOrder: { type: DataTypes.INTEGER, allowNull: false },
  weeklySubscription: { type: DataTypes.INTEGER, allowNull: false },
  monthlySubscription: { type: DataTypes.INTEGER, allowNull: false },
  imagePath: { type: DataTypes.STRING, allowNull: false },
  ingredients: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  discounts: { type: DataTypes.JSONB, allowNull: true }, // { single, weekly, monthly }
  description: { type: DataTypes.TEXT, allowNull: true },
});

export default Product;