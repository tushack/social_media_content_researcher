const express = require("express");

const {
  getAdminSummary,
  listAdminUsers,
  getAdminUser,
  updateAdminUserStatus,
  createAdminUserNote,
  listAdminActivity,
  listAdminCalendarEvents,
  listAdminMediaExports,
} = require("../controllers/admin.controller");

const { requireFirebaseAuth } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/admin.middleware");

const router = express.Router();

router.use(requireFirebaseAuth, requireAdmin);

// Lightweight endpoint used by the frontend before rendering /admin.
// The middleware above already verifies the Firebase token and admin role.
router.get("/access", (req, res) => {
  return res.status(200).json({
    allowed: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
    },
  });
});

router.get("/overview", getAdminSummary);
router.get("/users", listAdminUsers);
router.get("/users/:userId", getAdminUser);
router.patch("/users/:userId/status", updateAdminUserStatus);
router.post("/users/:userId/notes", createAdminUserNote);

router.get("/activity", listAdminActivity);
router.get("/calendar-events", listAdminCalendarEvents);
router.get("/media-exports", listAdminMediaExports);

module.exports = router;
