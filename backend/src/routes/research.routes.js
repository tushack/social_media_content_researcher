const express = require("express");
const router = express.Router();

const {
  generateResearch,
  getResearchHistory,
  analyzeCompetitorChannel,
} = require("../controllers/research.controller");

router.post("/generate", generateResearch);
router.get("/history", getResearchHistory);
router.post("/analyze-channel", analyzeCompetitorChannel);

module.exports = router;