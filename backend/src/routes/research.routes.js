const express = require("express");
const router = express.Router();

const {
  generateResearch,
  getResearchHistory,
  analyzeCompetitorChannel,
  createContentPack,
  generateThumbnail,
} = require("../controllers/research.controller");

router.post("/generate", generateResearch);
router.get("/history", getResearchHistory);
router.post("/analyze-channel", analyzeCompetitorChannel);
router.post("/content-pack", createContentPack);
router.post("/thumbnail", generateThumbnail);

module.exports = router;