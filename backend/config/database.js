// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    logging: false,
  }
);

export default sequelize;




