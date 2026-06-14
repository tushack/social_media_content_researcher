const {
  createYoutubeAuthUrl,
  handleYoutubeCallback,
  getYoutubeConnection,
  applyYoutubeReadyKit,
} = require("../services/youtube.service");

async function getAuthUrl(req, res) {
  try {
    const url = await createYoutubeAuthUrl({
      userId: req.user.uid,
      email: req.user.email,
    });

    return res.json({ url });
  } catch (error) {
    console.error("YouTube auth URL error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create YouTube auth URL.",
    });
  }
}

async function youtubeCallback(req, res) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?youtube=failed`);
    }

    await handleYoutubeCallback({ code, state });

    return res.redirect(`${process.env.FRONTEND_URL}/settings?youtube=connected`);
  } catch (error) {
    console.error("YouTube callback error:", error);

    return res.redirect(`${process.env.FRONTEND_URL}/settings?youtube=failed`);
  }
}

async function getConnection(req, res) {
  try {
    const connection = await getYoutubeConnection(req.user.uid);

    return res.json({
      connected: Boolean(connection?.channel_id),
      connection,
    });
  } catch (error) {
    console.error("YouTube connection error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch YouTube connection.",
    });
  }
}

async function applyKit(req, res) {
  try {
    const result = await applyYoutubeReadyKit({
      userId: req.user.uid,
      videoUrl: req.body.videoUrl,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      thumbnailUrl: req.body.thumbnailUrl,
    });

    return res.json({
      message: "YouTube Ready Kit applied successfully.",
      result,
    });
  } catch (error) {
    console.error("Apply YouTube Ready Kit error:", error);

    return res.status(500).json({
      message: error.message || "Failed to apply YouTube Ready Kit.",
    });
  }
}

module.exports = {
  getAuthUrl,
  youtubeCallback,
  getConnection,
  applyKit,
};