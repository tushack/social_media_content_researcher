const {
  getTrendFeedService,
  searchTrendTopicsService,
} = require("../services/trends.service");

async function getTrendFeed(req, res) {
  try {
    const result = await getTrendFeedService({
      userId: req.user.uid,
      query: req.query || {},
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get trend feed error:", error);

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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Search trend topics error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to search live trends.",
    });
  }
}

module.exports = {
  getTrendFeed,
  searchTrendTopics,
};