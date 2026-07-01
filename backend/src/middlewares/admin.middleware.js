function getConfiguredAdminEmails() {
  return new Set(
    String(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminUser(user) {
  if (!user) return false;

  if (user.isAdmin === true) {
    return true;
  }

  const email = String(user.email || "").trim().toLowerCase();

  return Boolean(email && getConfiguredAdminEmails().has(email));
}

function requireAdmin(req, res, next) {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({
      message: "Admin access is required for this endpoint.",
    });
  }

  return next();
}

module.exports = {
  requireAdmin,
  isAdminUser,
};
