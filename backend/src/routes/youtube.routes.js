const express = require("express");
const router = express.Router();

const {
  getAuthUrl,
  youtubeCallback,
  getConnection,
  applyKit,
} = require("../controllers/youtube.controller");

const {
  requireFirebaseAuth,
} = require("../middlewares/auth.middleware");

router.get("/auth-url", requireFirebaseAuth, getAuthUrl);
router.get("/callback", youtubeCallback);
router.get("/connection", requireFirebaseAuth, getConnection);
router.post("/apply-kit", requireFirebaseAuth, applyKit);

module.exports = router;