// seeders/adminSeeder.js
import Admin from "../models/Admin.js";

export const seedAdmin = async (email, password) => {
  try {
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (!existingAdmin) {
      // Pass plain password - model hook will hash it
      await Admin.create({ email, password });
      console.log("✅ Admin created successfully!");
    } else {
      // For updates, set password directly - model hook will hash it
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log("🔁 Admin password updated from .env values");
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
  }
};
