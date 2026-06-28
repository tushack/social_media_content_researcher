const {
  createResearchResult,
  analyzeCompetitorChannelResult,
  createContentPackResult,
  generateThumbnailResult,
} = require("../services/research.service");

const {
  getResearchHistoryService,
} = require("../services/researchHistory.service");

const {
  getDailyNicheIdeasService,
} = require("../services/dailyIdeas.service");

const {
  getTopYouTubeChannelsForNiche,
} = require("../services/youtubeTopChannels.service");

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
      userId: req.user.uid,
      maxTopics: 20,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Research error:", error);

    return res.status(500).json({
      message: "Something went wrong while generating research",
    });
  }
}


async function getDailyNicheIdeas(req, res) {
  try {
    const { niche, platform, audience, limit, forceRefresh } = req.query;

    const result = await getDailyNicheIdeasService({
      userId: req.user.uid,
      niche,
      platform: platform || "YouTube",
      audience: audience || "New creators",
      limit: Number(limit) || 20,
      forceRefresh: forceRefresh === "true",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Daily niche ideas error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch daily niche ideas",
    });
  }
}

async function getTopYouTubeChannels(req, res) {
  try {
    const { niche, limit } = req.query || {};

    if (!String(niche || "").trim()) {
      return res.status(400).json({
        message: "Niche is required to find YouTube channels.",
      });
    }

    const result = await getTopYouTubeChannelsForNiche({
      niche: String(niche).trim(),
      limit: Number(limit) || 4,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Top YouTube channels error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to fetch YouTube channels.",
    });
  }
}

async function getResearchHistory(req, res) {
  try {
    const data = await getResearchHistoryService(req.user.uid);

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
    const { channelUrl } = req.body || {};

    if (!String(channelUrl || "").trim()) {
      return res.status(400).json({
        message: "Channel URL, channel ID, or @handle is required.",
      });
    }

    const result = await analyzeCompetitorChannelResult({
      channelUrl: String(channelUrl).trim(),
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Analyze competitor channel error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to analyze competitor channel.",
    });
  }
}

async function createContentPack(req, res) {
  try {
    const result = await createContentPackResult(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    console.error("Create content pack error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create content pack",
    });
  }
}

async function generateThumbnail(req, res) {
  try {
    const { pack, prompt, variant } = req.body || {};

    if (!pack || !pack.topic) {
      return res.status(400).json({
        message: "Content pack with topic is required",
      });
    }

    const result = await generateThumbnailResult({
      pack,
      prompt,
      variant,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Generate thumbnail error:", error);

    return res.status(500).json({
      message: error.message || "Failed to generate AI thumbnail",
    });
  }
}

module.exports = {
  generateResearch,
  getDailyNicheIdeas,
  getTopYouTubeChannels,
  getResearchHistory,
  analyzeCompetitorChannel,
  createContentPack,
  generateThumbnail,
};