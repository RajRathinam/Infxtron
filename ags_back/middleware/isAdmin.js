import Admin from "../models/Admin.js";

export const isAdmin = async (req, res, next) => {
  try {
    console.log('Session check:', {
      sessionExists: !!req.session,
      adminId: req.session?.adminId,
      sessionID: req.sessionID
    });

    // Check if session exists and adminId is set
    if (!req.session || !req.session.adminId) {
      console.log('Unauthorized: No session or adminId');
      return res.status(401).json({ 
        message: "Unauthorized, please login",
        sessionExists: !!req.session,
        hasAdminId: !!req.session?.adminId
      });
    }

    // Verify admin still exists in DB
    const admin = await Admin.findByPk(req.session.adminId);
    if (!admin) {
      console.log('Admin not found in database');
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Unauthorized, admin not found" });
    }

    // Attach admin to request for further use
    req.admin = admin;
    console.log('Admin authorized:', admin.email);
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};