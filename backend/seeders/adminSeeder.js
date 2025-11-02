// seeders/adminSeeder.js
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

export const seedAdmin = async (email, password) => {
  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!existingAdmin) {
      await Admin.create({ email, password: hashedPassword });
      console.log("✅ Admin created successfully!");
    } else {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("🔁 Admin password updated from .env values");
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
  }
};
