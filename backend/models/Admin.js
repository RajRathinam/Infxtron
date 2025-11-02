import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

const Admin = sequelize.define("Admin", {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
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
