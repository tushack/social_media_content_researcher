const { google } = require("googleapis");
const { Readable } = require("stream");
const supabase = require("../config/supabase");

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getYoutubeScopes() {
  return [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ];
}

function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(state) {
  return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
}

function getYoutubeVideoId(input = "") {
  const value = String(input || "").trim();

  const normalMatch = value.match(/[?&]v=([^&]+)/);
  if (normalMatch?.[1]) return normalMatch[1];

  const shortMatch = value.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return shortMatch[1];

  const shortsMatch = value.match(/shorts\/([^?&]+)/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  if (/^[a-zA-Z0-9_-]{8,}$/.test(value)) return value;

  return "";
}

async function createYoutubeAuthUrl({ userId, email }) {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: getYoutubeScopes(),
    state: encodeState({ userId, email }),
  });
}

async function handleYoutubeCallback({ code, state }) {
  const { userId, email } = decodeState(state);

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const channelResponse = await youtube.channels.list({
    part: ["snippet", "statistics"],
    mine: true,
  });

  const channel = channelResponse.data.items?.[0];

  if (!channel) {
    throw new Error(
      "No YouTube channel found. Please create/select a YouTube channel for this Google account."
    );
  }

  const payload = {
    user_id: userId,
    email: email || "",
    channel_id: channel.id,
    channel_title: channel.snippet?.title || "",
    channel_thumbnail:
      channel.snippet?.thumbnails?.default?.url ||
      channel.snippet?.thumbnails?.medium?.url ||
      "",
    access_token: tokens.access_token || "",
    refresh_token: tokens.refresh_token || "",
    token_expiry: tokens.expiry_date || 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("youtube_connections")
    .upsert(payload, {
      onConflict: "user_id",
    });

  if (error) throw new Error(error.message);

  return payload;
}

async function getYoutubeConnection(userId) {
  const { data, error } = await supabase
    .from("youtube_connections")
    .select("channel_id, channel_title, channel_thumbnail, email, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

async function getAuthorizedYoutubeClient(userId) {
  const { data, error } = await supabase
    .from("youtube_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data?.refresh_token) {
    throw new Error("YouTube channel is not connected.");
  }

  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.token_expiry,
  });

  oauth2Client.on("tokens", async (tokens) => {
    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (tokens.access_token) updatePayload.access_token = tokens.access_token;
    if (tokens.refresh_token) updatePayload.refresh_token = tokens.refresh_token;
    if (tokens.expiry_date) updatePayload.token_expiry = tokens.expiry_date;

    await supabase
      .from("youtube_connections")
      .update(updatePayload)
      .eq("user_id", userId);
  });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
}

async function applyYoutubeReadyKit({
  userId,
  videoUrl,
  title,
  description,
  tags,
  thumbnailUrl,
}) {
  const videoId = getYoutubeVideoId(videoUrl);

  if (!videoId) {
    throw new Error("Valid YouTube video URL or video ID is required.");
  }

  const youtube = await getAuthorizedYoutubeClient(userId);

  const currentVideo = await youtube.videos.list({
    part: ["snippet", "status"],
    id: [videoId],
  });

  const video = currentVideo.data.items?.[0];

  if (!video) {
    throw new Error("Video not found. Please check uploaded video URL.");
  }

  const categoryId = video.snippet?.categoryId || "22";

  await youtube.videos.update({
    part: ["snippet"],
    requestBody: {
      id: videoId,
      snippet: {
        categoryId,
        title: String(title || "").slice(0, 100),
        description: description || "",
        tags: Array.isArray(tags) ? tags.slice(0, 30) : [],
      },
    },
  });

  let thumbnailUpdated = false;

  if (thumbnailUrl) {
    try {
      const imageResponse = await fetch(thumbnailUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      await youtube.thumbnails.set({
        videoId,
        media: {
          mimeType: "image/png",
          body: Readable.from(imageBuffer),
        },
      });

      thumbnailUpdated = true;
    } catch (error) {
      console.error("Thumbnail update failed:", error.message);
    }
  }

  return {
    videoId,
    metadataUpdated: true,
    thumbnailUpdated,
    studioUrl: `https://studio.youtube.com/video/${videoId}/edit`,
  };
}

module.exports = {
  createYoutubeAuthUrl,
  handleYoutubeCallback,
  getYoutubeConnection,
  applyYoutubeReadyKit,
};