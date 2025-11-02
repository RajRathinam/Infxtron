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



DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=12348765
DB_NAME=Test
DB_PORT=5432

DATABASE_URL=

PORT=5000
SESSION_SECRET=your_strong_secret_key_here

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=restart18112024@gmail.com
SMTP_PASS=<new_app_password_from_google>
OWNER_EMAIL=rajrathinam2005@gmail.com
