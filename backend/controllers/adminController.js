import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";


// Login admin and store session
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Store session
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Logout admin and destroy session
export const adminLogout = async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed", error: err });
      res.clearCookie("connect.sid"); // clear cookie
      res.status(200).json({ message: "Logout successful" });
    });
  } else {
    res.status(200).json({ message: "Logout successful" });
  }
};

// Change admin password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Find the logged-in admin using session
    const admin = await Admin.findByPk(req.session.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
