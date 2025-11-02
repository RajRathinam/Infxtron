import Admin from "../models/Admin.js";

export const isAdmin = async (req, res, next) => {
  try {
    // Check if session exists and adminId is set
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    // Optional: Verify admin still exists in DB
    const admin = await Admin.findByPk(req.session.adminId);
    if (!admin) {
      // Destroy session if admin no longer exists
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Unauthorized, admin not found" });
    }

    // Attach admin to request for further use
    req.admin = admin;
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

