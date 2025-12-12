import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

// models/Admin.js - Update your model
const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ],
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        const hashed = await bcrypt.hash(admin.password, 10);
        admin.password = hashed;
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed("password")) {
        const hashed = await bcrypt.hash(admin.password, 10);
        admin.password = hashed;
      }
    },
  },
});

export default Admin;