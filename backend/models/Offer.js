import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Offer = sequelize.define("Offer", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  imagePath: { type: DataTypes.STRING, allowNull: false },
  startsAt: { type: DataTypes.DATE, allowNull: true },
  endsAt: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

export default Offer;


