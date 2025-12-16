import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
  productName: { type: DataTypes.STRING, allowNull: false },
  category: { 
    type: DataTypes.ENUM('veg', 'nonveg', 'eggeterian'),
    allowNull: false,
    defaultValue: 'veg'
  },
  
  // Normal Pack
  normalWeight: { type: DataTypes.STRING, allowNull: false },
  normalProteinIntake: { type: DataTypes.STRING, allowNull: true },
  normalSingleOrder: { type: DataTypes.INTEGER, allowNull: false },
  normalWeeklySubscription: { type: DataTypes.INTEGER, allowNull: false },
  normalMonthlySubscription: { type: DataTypes.INTEGER, allowNull: false },
  
  // Meal Pack
  mealWeight: { type: DataTypes.STRING, allowNull: true },
  mealProteinIntake: { type: DataTypes.STRING, allowNull: true },
  mealSingleOrder: { type: DataTypes.INTEGER, allowNull: true },
  mealWeeklySubscription: { type: DataTypes.INTEGER, allowNull: true },
  mealMonthlySubscription: { type: DataTypes.INTEGER, allowNull: true },
  
  // Family Pack
  familyWeight: { type: DataTypes.STRING, allowNull: true },
  familyProteinIntake: { type: DataTypes.STRING, allowNull: true },
  familySingleOrder: { type: DataTypes.INTEGER, allowNull: true },
  familyWeeklySubscription: { type: DataTypes.INTEGER, allowNull: true },
  familyMonthlySubscription: { type: DataTypes.INTEGER, allowNull: true },
  
  availableDay: { 
    type: DataTypes.TEXT,
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
  imagePath: { type: DataTypes.STRING, allowNull: false },
  ingredients: { 
    type: DataTypes.TEXT,
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
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  indexes: [
    {
      fields: ['category']
    }
  ]
});

export default Product;