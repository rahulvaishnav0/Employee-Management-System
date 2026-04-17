const { verifyToken, COOKIE_NAME } = require("../utils/jwt");
const { User } = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    req.user = user;
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Not authenticated" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

module.exports = { requireAuth, requireRole };

