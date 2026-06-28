const {
  getYoutubeVideoPreview,
  convertOwnedMedia,
  getMediaExportHistory,
  getOwnedMediaExport,
  deleteOwnedMediaExport,
  removeTemporaryInputFile,
} = require("../services/mediaExport.service");

function sendServiceError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    message: error.message || fallbackMessage,
  });
}

async function previewYoutubeMedia(req, res) {
  try {
    const preview = await getYoutubeVideoPreview({
      videoUrl: req.body?.videoUrl,
    });

    return res.status(200).json({ preview });
  } catch (error) {
    console.error("YouTube media preview error:", error);
    return sendServiceError(res, error, "Could not load YouTube preview.");
  }
}

async function convertMediaExport(req, res) {
  try {
    const exportItem = await convertOwnedMedia({
      userId: req.user.uid,
      file: req.file || null,
      outputType: req.body?.outputType,
      audioBitrate: req.body?.audioBitrate,
      videoQuality: req.body?.videoQuality,
      rightsAcknowledged: req.body?.rightsAcknowledged,
      youtubeUrl: req.body?.youtubeUrl,
      youtubeVideoId: req.body?.youtubeVideoId,
      youtubeTitle: req.body?.youtubeTitle,
    });

    return res.status(201).json({
      message: "Your media export is ready.",
      exportItem,
    });
  } catch (error) {
    console.error("Media conversion error:", error);
    return sendServiceError(res, error, "Could not export media.");
  } finally {
    await removeTemporaryInputFile(req.file?.path);
  }
}

async function getMediaExports(req, res) {
  try {
    const items = await getMediaExportHistory({
      userId: req.user.uid,
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Media export history error:", error);
    return sendServiceError(res, error, "Could not load media export history.");
  }
}

async function downloadMediaExport(req, res) {
  try {
    const { record, outputPath } = await getOwnedMediaExport({
      userId: req.user.uid,
      exportId: req.params.exportId,
    });

    res.type(record.output_mime_type || "application/octet-stream");

    return res.download(outputPath, record.output_name, (error) => {
      if (!error) return;

      console.error("Media export download error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          message: "Could not download this media export.",
        });
      }
    });
  } catch (error) {
    console.error("Get media export download error:", error);
    return sendServiceError(res, error, "Could not download media export.");
  }
}

async function deleteMediaExport(req, res) {
  try {
    const result = await deleteOwnedMediaExport({
      userId: req.user.uid,
      exportId: req.params.exportId,
    });

    return res.status(200).json({
      message: "Media export deleted.",
      result,
    });
  } catch (error) {
    console.error("Delete media export error:", error);
    return sendServiceError(res, error, "Could not delete media export.");
  }
}

module.exports = {
  previewYoutubeMedia,
  convertMediaExport,
  getMediaExports,
  downloadMediaExport,
  deleteMediaExport,
};