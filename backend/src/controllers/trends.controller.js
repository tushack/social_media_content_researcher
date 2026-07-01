const {
  getTrendFeedService,
  searchTrendTopicsService,
} = require("../services/trends.service");

const { logActivitySafe } = require("../services/activityLog.service");

async function getTrendFeed(req, res) {
  try {
    const result = await getTrendFeedService({
      userId: req.user.uid,
      query: req.query || {},
    });

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "trends.feed_loaded",
      module: "trends",
      metadata: {
        platform: req.query?.platform || "",
        region: req.query?.region || "",
        itemCount: Array.isArray(result?.items)
          ? result.items.length
          : Array.isArray(result?.sections)
            ? result.sections.reduce(
                (total, section) => total + (section?.items?.length || 0),
                0
              )
            : 0,
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get trend feed error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "trends.feed_failed",
      module: "trends",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to load live trends.",
    });
  }
}

async function searchTrendTopics(req, res) {
  try {
    const result = await searchTrendTopicsService({
      userId: req.user.uid,
      payload: req.body || {},
    });

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "trends.searched",
      module: "trends",
      metadata: {
        query: req.body?.query || req.body?.search || "",
        platform: req.body?.platform || "",
        region: req.body?.region || "",
        itemCount: Array.isArray(result?.items) ? result.items.length : 0,
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Search trend topics error:", error);

    await logActivitySafe({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      eventType: "trends.search_failed",
      module: "trends",
      status: "failed",
      metadata: { message: error.message },
      req,
    });

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to search live trends.",
    });
  }
}

module.exports = {
  getTrendFeed,
  searchTrendTopics,
};
