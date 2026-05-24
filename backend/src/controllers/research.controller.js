const {
  createResearchResult,
  analyzeCompetitorChannelResult,
} = require("../services/research.service");

const {
  getResearchHistoryService,
} = require("../services/researchHistory.service");

async function generateResearch(req, res) {
  try {
    const { niche, platform, audience } = req.body;

    if (!niche || !platform || !audience) {
      return res.status(400).json({
        message: "Niche, platform, and audience are required",
      });
    }

    const result = await createResearchResult({
      niche,
      platform,
      audience,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Research error:", error);

    return res.status(500).json({
      message: "Something went wrong while generating research",
    });
  }
}

async function getResearchHistory(req, res) {
  try {
    const data = await getResearchHistoryService();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Research history error:", error);

    return res.status(500).json({
      message: "Failed to fetch research history",
    });
  }
}

async function analyzeCompetitorChannel(req, res) {
  try {
    const { channelUrl } = req.body;

    if (!channelUrl) {
      return res.status(400).json({
        message: "Channel URL is required",
      });
    }

    const result = await analyzeCompetitorChannelResult({
      channelUrl,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Analyze competitor channel error:", error);

    return res.status(500).json({
      message: error.message || "Failed to analyze competitor channel",
    });
  }
}

module.exports = {
  generateResearch,
  getResearchHistory,
  analyzeCompetitorChannel,
};