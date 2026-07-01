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

const { logActivitySafe } = require("../services/activityLog.service");

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

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "research.generated",
      module: "research",
      entityId: result?.id || "",
      metadata: {
        niche,
        platform,
        audience,
        topicCount: Array.isArray(result?.trendingTopics)
          ? result.trendingTopics.length
          : 0,
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Research error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "research.generate_failed",
      module: "research",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

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

    if (result?.source !== "empty") {
      await logActivitySafe({
        userId: req.user.uid,
        userEmail: req.user.email,
        eventType: result?.meta?.isCached
          ? "ai.daily_ideas_viewed"
          : "ai.daily_ideas_generated",
        module: "ai",
        entityId: result?.meta?.latestQueryId || "",
        metadata: {
          niche: result?.niche || niche || "",
          platform: result?.platform || platform || "YouTube",
          audience: result?.audience || audience || "New creators",
          source: result?.source || "",
          isCached: Boolean(result?.meta?.isCached),
          topicCount: Array.isArray(result?.trendingTopics)
            ? result.trendingTopics.length
            : 0,
          hookCount: Array.isArray(result?.viralHooks)
            ? result.viralHooks.length
            : 0,
          titleCount: Array.isArray(result?.titleSuggestions)
            ? result.titleSuggestions.length
            : 0,
        },
        req,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Daily niche ideas error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "ai.daily_ideas_failed",
      module: "ai",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

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

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "youtube.top_channels_loaded",
      module: "youtube",
      metadata: {
        niche: String(niche).trim(),
        channelCount: Array.isArray(result?.channels) ? result.channels.length : 0,
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Top YouTube channels error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "youtube.top_channels_failed",
      module: "youtube",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

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

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "competitor.channel_analyzed",
      module: "competitor",
      metadata: {
        channelUrl: String(channelUrl).trim(),
        channelName: result?.channel || result?.channelTitle || "",
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Analyze competitor channel error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "competitor.channel_analysis_failed",
      module: "competitor",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to analyze competitor channel.",
    });
  }
}

async function createContentPack(req, res) {
  try {
    const result = await createContentPackResult(req.body || {});

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "content_pack.generated",
      module: "content_pack",
      metadata: {
        topic: req.body?.topic || result?.topic || "",
        niche: req.body?.niche || "",
        platform: req.body?.platform || "",
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Create content pack error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "content_pack.generate_failed",
      module: "content_pack",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

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

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "thumbnail.generated",
      module: "content_pack",
      metadata: {
        topic: pack.topic,
        variant: variant || "",
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Generate thumbnail error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "thumbnail.generate_failed",
      module: "content_pack",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

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
