// seeders/adminSeeder.js
import Admin from "../models/Admin.js";

export const seedAdmin = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      console.error("❌ Email and password are required for admin seeding");
      return;
    }

    const existingAdmin = await Admin.findOne({ where: { email } });

    if (!existingAdmin) {
      // Pass plain password - model hook will hash it
      await Admin.create({ email, password });
      console.log("✅ Admin created successfully!");
    } else {
      // Check if password actually changed to avoid unnecessary hashing
      const isPasswordChanged = password !== existingAdmin.password;
      
      if (isPasswordChanged) {
        existingAdmin.password = password;
        await existingAdmin.save();
        console.log("🔁 Admin password updated from .env values");
      } else {
        console.log("ℹ️  Admin already exists with current password");
      }
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    
    // More detailed error logging for debugging
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.error("   Duplicate email address");
    } else if (err.name === 'SequelizeValidationError') {
      console.error("   Validation error:", err.errors.map(e => e.message));
    }
  }
};