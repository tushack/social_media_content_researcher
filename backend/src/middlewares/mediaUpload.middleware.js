const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const MEDIA_EXPORT_ROOT = path.resolve(
  process.cwd(),
  process.env.MEDIA_EXPORT_STORAGE_DIR || "storage/media_exports"
);

const INCOMING_DIR = path.join(MEDIA_EXPORT_ROOT, "incoming");

const MAX_UPLOAD_SIZE_MB = Math.max(
  50,
  Number(process.env.MEDIA_EXPORT_MAX_FILE_SIZE_MB || 1024)
);

const ALLOWED_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v",
]);

function ensureIncomingDirectory() {
  fs.mkdirSync(INCOMING_DIR, { recursive: true });
}

function getFileExtension(file) {
  return path.extname(String(file?.originalname || "")).toLowerCase();
}

function isAllowedOriginalVideo(file) {
  const extension = getFileExtension(file);

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return false;
  }

  const mimeType = String(file?.mimetype || "").toLowerCase();

  return (
    !mimeType ||
    mimeType.startsWith("video/") ||
    mimeType === "application/octet-stream"
  );
}

ensureIncomingDirectory();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    ensureIncomingDirectory();
    callback(null, INCOMING_DIR);
  },

  filename(req, file, callback) {
    const extension = getFileExtension(file) || ".mp4";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const ownedMediaUpload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!isAllowedOriginalVideo(file)) {
      return callback(
        new Error(
          "Only original video files are allowed: MP4, MOV, MKV, WEBM, AVI, or M4V."
        )
      );
    }

    return callback(null, true);
  },
});

module.exports = {
  ownedMediaUpload,
  MEDIA_EXPORT_ROOT,
  INCOMING_DIR,
  MAX_UPLOAD_SIZE_MB,
};