const crypto = require("crypto");
const { google } = require("googleapis");
const { Readable } = require("stream");
const supabase = require("../config/supabase");

const YOUTUBE_FORCE_SSL_SCOPE =
  "https://www.googleapis.com/auth/youtube.force-ssl";
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const STATE_TTL_MS = 10 * 60 * 1000;
const ENCRYPTED_TOKEN_PREFIX = "enc:v1:";

function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanString(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function getRequiredEnv(name) {
  const value = cleanString(process.env[name], 4000);

  if (!value) {
    throw createHttpError(`${name} is missing in backend/.env.`, 500);
  }

  return value;
}

function getOAuthConfig() {
  return {
    clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: getRequiredEnv("GOOGLE_REDIRECT_URI"),
  };
}

function getFrontendUrl() {
  return cleanString(process.env.FRONTEND_URL, 2000) || "http://localhost:5173";
}

function getStateSecret() {
  return getRequiredEnv("YOUTUBE_OAUTH_STATE_SECRET");
}

function getTokenEncryptionKey() {
  const secret = cleanString(process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY, 4000);

  if (!secret) {
    throw createHttpError(
      "YOUTUBE_TOKEN_ENCRYPTION_KEY is missing in backend/.env.",
      500
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function getOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getYoutubeScopes() {
  // This scope is sufficient for channel lookup, video metadata updates,
  // and custom thumbnail updates. Do not request broader scopes unnecessarily.
  return [YOUTUBE_FORCE_SSL_SCOPE];
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createSignedState({ userId }) {
  const now = Date.now();
  const payload = {
    version: 1,
    userId: cleanString(userId, 500),
    issuedAt: now,
    expiresAt: now + STATE_TTL_MS,
    nonce: crypto.randomBytes(24).toString("hex"),
  };

  if (!payload.userId) {
    throw createHttpError("Missing user ID for YouTube connection.", 400);
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getStateSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifySignedState(state) {
  const value = cleanString(state, 8000);
  const [encodedPayload, receivedSignature] = value.split(".");

  if (!encodedPayload || !receivedSignature) {
    throw createHttpError("Invalid YouTube connection state.", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", getStateSecret())
    .update(encodedPayload)
    .digest("base64url");

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw createHttpError("Invalid or tampered YouTube connection state.", 400);
  }

  let payload;

  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload));
  } catch {
    throw createHttpError("Invalid YouTube connection state payload.", 400);
  }

  if (
    !payload ||
    payload.version !== 1 ||
    !cleanString(payload.userId, 500) ||
    !Number.isFinite(Number(payload.expiresAt)) ||
    Date.now() > Number(payload.expiresAt)
  ) {
    throw createHttpError("YouTube connection request expired. Please try again.", 400);
  }

  return {
    userId: cleanString(payload.userId, 500),
  };
}

function encryptToken(value) {
  const token = cleanString(value, 12000);

  if (!token) return "";

  const key = getTokenEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_TOKEN_PREFIX}${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptToken(value) {
  const token = cleanString(value, 16000);

  if (!token) return "";

  // Existing rows from the previous implementation were plaintext. They keep
  // working once and are re-encrypted automatically on the next token refresh.
  if (!token.startsWith(ENCRYPTED_TOKEN_PREFIX)) {
    return token;
  }

  const pieces = token.slice(ENCRYPTED_TOKEN_PREFIX.length).split(".");

  if (pieces.length !== 3) {
    throw createHttpError("Stored YouTube token has an invalid format.", 500);
  }

  try {
    const [ivValue, authTagValue, encryptedValue] = pieces;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getTokenEncryptionKey(),
      Buffer.from(ivValue, "base64url")
    );

    decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw createHttpError(
      "Unable to decrypt the stored YouTube token. Reconnect your YouTube channel.",
      500
    );
  }
}

function getYoutubeVideoId(input = "") {
  const value = cleanString(input, 2000);

  if (!value) return "";

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return cleanString(url.pathname.split("/").filter(Boolean)[0], 100);
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      const directVideoId = url.searchParams.get("v");
      if (directVideoId) return cleanString(directVideoId, 100);

      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = parts.indexOf("shorts");
      const embedIndex = parts.indexOf("embed");

      if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
        return cleanString(parts[shortsIndex + 1], 100);
      }

      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return cleanString(parts[embedIndex + 1], 100);
      }
    }
  } catch {
    // A raw video ID is handled below.
  }

  return /^[a-zA-Z0-9_-]{8,}$/.test(value) ? value : "";
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags
      .map((item) => cleanString(item, 120))
      .filter(Boolean)
      .slice(0, 30)
  )];
}

function getThumbnailMimeType(contentType) {
  const value = cleanString(contentType, 200).split(";")[0].toLowerCase();

  if (value === "image/jpeg" || value === "image/png") {
    return value;
  }

  return "";
}

async function fetchThumbnailImage(thumbnailUrl) {
  const value = cleanString(thumbnailUrl, 2000);

  if (!value) return null;

  let url;

  try {
    url = new URL(value);
  } catch {
    throw createHttpError("Thumbnail URL is invalid.", 400);
  }

  if (url.protocol !== "https:") {
    throw createHttpError("Thumbnail URL must use HTTPS.", 400);
  }

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw createHttpError("Could not download the selected thumbnail image.", 400);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);

  if (contentLength && contentLength > MAX_THUMBNAIL_BYTES) {
    throw createHttpError("Thumbnail must be 2 MB or smaller.", 400);
  }

  const mimeType = getThumbnailMimeType(response.headers.get("content-type"));

  if (!mimeType) {
    throw createHttpError("Thumbnail must be a PNG or JPEG image.", 400);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length || buffer.length > MAX_THUMBNAIL_BYTES) {
    throw createHttpError("Thumbnail must be 2 MB or smaller.", 400);
  }

  return {
    mimeType,
    buffer,
  };
}

function buildConnectionPayload(data) {
  if (!data?.channel_id) return null;

  return {
    channelId: data.channel_id,
    channelTitle: data.channel_title || "Connected YouTube channel",
    channelThumbnail: data.channel_thumbnail || "",
    connectedAt: data.created_at || null,
    updatedAt: data.updated_at || null,
  };
}

function getGoogleErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error?.message ||
    error?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
}

function getGoogleErrorStatus(error, fallbackStatus = 500) {
  const status = Number(error?.code || error?.response?.status || fallbackStatus);
  return Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : fallbackStatus;
}

async function createYoutubeAuthUrl({ userId, email }) {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: getYoutubeScopes(),
    state: createSignedState({ userId }),
    login_hint: cleanString(email, 320) || undefined,
  });
}

async function handleYoutubeCallback({ code, state }) {
  if (!cleanString(code, 5000)) {
    throw createHttpError("Missing YouTube authorization code.", 400);
  }

  const { userId } = verifySignedState(state);
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens?.access_token) {
    throw createHttpError("Google did not return an access token. Please reconnect.", 400);
  }

  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const channelResponse = await youtube.channels.list({
    part: ["snippet"],
    mine: true,
    maxResults: 1,
  });

  const channel = channelResponse.data.items?.[0];

  if (!channel?.id) {
    throw createHttpError(
      "No YouTube channel was found for this Google account. Create or select a YouTube channel, then try again.",
      400
    );
  }

  const { data: existingConnection, error: existingError } = await supabase
    .from("youtube_connections")
    .select("access_token, refresh_token, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw createHttpError(existingError.message || "Failed to read YouTube connection.", 500);
  }

  const refreshToken = tokens.refresh_token || decryptToken(existingConnection?.refresh_token);

  if (!refreshToken) {
    throw createHttpError(
      "Google did not return a refresh token. Remove this app from your Google Account permissions, then connect again.",
      400
    );
  }

  const payload = {
    user_id: userId,
    email: "",
    channel_id: channel.id,
    channel_title: cleanString(channel.snippet?.title, 300),
    channel_thumbnail:
      cleanString(channel.snippet?.thumbnails?.high?.url, 2000) ||
      cleanString(channel.snippet?.thumbnails?.medium?.url, 2000) ||
      cleanString(channel.snippet?.thumbnails?.default?.url, 2000),
    access_token: encryptToken(
      tokens.access_token || decryptToken(existingConnection?.access_token)
    ),
    refresh_token: encryptToken(refreshToken),
    token_expiry: Number(tokens.expiry_date || 0),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("youtube_connections")
    .upsert(payload, { onConflict: "user_id" })
    .select("channel_id, channel_title, channel_thumbnail, created_at, updated_at")
    .single();

  if (error) {
    throw createHttpError(error.message || "Failed to save YouTube connection.", 500);
  }

  return buildConnectionPayload(data || payload);
}

async function getYoutubeConnection(userId) {
  const { data, error } = await supabase
    .from("youtube_connections")
    .select("channel_id, channel_title, channel_thumbnail, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw createHttpError(error.message || "Failed to fetch YouTube connection.", 500);
  }

  return buildConnectionPayload(data);
}

async function getAuthorizedYoutubeClient(userId) {
  const { data, error } = await supabase
    .from("youtube_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw createHttpError(error.message || "Failed to fetch YouTube connection.", 500);
  }

  const refreshToken = decryptToken(data?.refresh_token);

  if (!data?.channel_id || !refreshToken) {
    throw createHttpError("YouTube channel is not connected. Connect it from Settings first.", 409);
  }

  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: decryptToken(data.access_token),
    refresh_token: refreshToken,
    expiry_date: Number(data.token_expiry || 0) || undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (tokens.access_token) {
      updatePayload.access_token = encryptToken(tokens.access_token);
    }

    if (tokens.refresh_token) {
      updatePayload.refresh_token = encryptToken(tokens.refresh_token);
    }

    if (tokens.expiry_date) {
      updatePayload.token_expiry = Number(tokens.expiry_date);
    }

    const { error: updateError } = await supabase
      .from("youtube_connections")
      .update(updatePayload)
      .eq("user_id", userId);

    if (updateError) {
      console.error("YouTube token refresh save failed:", updateError.message);
    }
  });

  return {
    youtube: google.youtube({
      version: "v3",
      auth: oauth2Client,
    }),
    connection: buildConnectionPayload(data),
  };
}

async function disconnectYoutubeConnection(userId) {
  const { data, error } = await supabase
    .from("youtube_connections")
    .select("refresh_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw createHttpError(error.message || "Failed to read YouTube connection.", 500);
  }

  if (data?.refresh_token) {
    try {
      const oauth2Client = getOAuthClient();
      await oauth2Client.revokeToken(decryptToken(data.refresh_token));
    } catch (error) {
      // Token may already be revoked or expired. Local removal should still work.
      console.warn("YouTube token revoke skipped:", getGoogleErrorMessage(error, "Unknown error"));
    }
  }

  const { error: deleteError } = await supabase
    .from("youtube_connections")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw createHttpError(deleteError.message || "Failed to disconnect YouTube.", 500);
  }

  return { disconnected: true };
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
    throw createHttpError("Valid YouTube video URL, Shorts URL, or video ID is required.", 400);
  }

  const { youtube, connection } = await getAuthorizedYoutubeClient(userId);

  try {
    const currentVideo = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
      maxResults: 1,
    });

    const video = currentVideo.data.items?.[0];

    if (!video?.id) {
      throw createHttpError("Video not found. Check the YouTube video URL.", 404);
    }

    if (
      connection?.channelId &&
      video.snippet?.channelId &&
      video.snippet.channelId !== connection.channelId
    ) {
      throw createHttpError(
        "This video belongs to a different YouTube channel. Connect the owner channel and try again.",
        403
      );
    }

    const nextTitle = cleanString(title, 100) || cleanString(video.snippet?.title, 100);
    const nextDescription = String(description || video.snippet?.description || "").slice(0, 5000);
    const nextTags = normalizeTags(tags);

    if (!nextTitle) {
      throw createHttpError("A valid YouTube title is required.", 400);
    }

    const snippet = {
      categoryId: cleanString(video.snippet?.categoryId, 20) || "22",
      title: nextTitle,
      description: nextDescription,
      tags: nextTags.length ? nextTags : normalizeTags(video.snippet?.tags),
    };

    if (video.snippet?.defaultLanguage) {
      snippet.defaultLanguage = cleanString(video.snippet.defaultLanguage, 20);
    }

    await youtube.videos.update({
      part: ["snippet"],
      requestBody: {
        id: videoId,
        snippet,
      },
    });

    let thumbnailUpdated = false;

    if (cleanString(thumbnailUrl, 2000)) {
      const thumbnail = await fetchThumbnailImage(thumbnailUrl);

      await youtube.thumbnails.set({
        videoId,
        media: {
          mimeType: thumbnail.mimeType,
          body: Readable.from(thumbnail.buffer),
        },
      });

      thumbnailUpdated = true;
    }

    return {
      videoId,
      metadataUpdated: true,
      thumbnailUpdated,
      studioUrl: `https://studio.youtube.com/video/${videoId}/edit`,
    };
  } catch (error) {
    if (error.statusCode) throw error;

    throw createHttpError(
      getGoogleErrorMessage(error, "Failed to update YouTube video metadata."),
      getGoogleErrorStatus(error, 500)
    );
  }
}

module.exports = {
  createYoutubeAuthUrl,
  handleYoutubeCallback,
  getYoutubeConnection,
  disconnectYoutubeConnection,
  applyYoutubeReadyKit,
};
