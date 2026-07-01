const {
  requestRecordsDeletion,
  sendDeleteAccountOtp,
  confirmDeleteAccount,
  purgeDueDeletionArchives,
} = require("../services/dataPrivacy.service");

const { logActivitySafe } = require("../services/activityLog.service");

async function deleteSelectedRecords(req, res) {
  try {
    const { targets } = req.body || {};

    const result = await requestRecordsDeletion({
      userId: req.user.uid,
      email: req.user.email,
      targets,
    });

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "privacy.records_deletion_requested",
      module: "privacy",
      metadata: {
        targets: Array.isArray(targets) ? targets : [],
      },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete selected records error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete selected records.",
    });
  }
}

async function requestDeleteAccountOtp(req, res) {
  try {
    const result = await sendDeleteAccountOtp({
      userId: req.user.uid,
      email: req.user.email,
    });

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "privacy.account_deletion_otp_requested",
      module: "privacy",
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Request delete account OTP error:", error);

    return res.status(500).json({
      message: error.message || "Failed to send verification code.",
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const { code } = req.body || {};

    if (!code || String(code).length !== 4) {
      return res.status(400).json({
        message: "Valid 4-digit code is required.",
      });
    }

    const result = await confirmDeleteAccount({
      userId: req.user.uid,
      email: req.user.email,
      code,
    });

    await logActivitySafe({
      userId: req.user.uid,
      userEmail: req.user.email,
      eventType: "privacy.account_deletion_requested",
      module: "privacy",
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete account.",
    });
  }
}

async function purgeDueArchives(req, res) {
  try {
    const cronSecret = req.headers["x-cron-secret"];

    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        message: "Unauthorized cron request.",
      });
    }

    const result = await purgeDueDeletionArchives();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Purge due archives error:", error);

    return res.status(500).json({
      message: error.message || "Failed to purge due archives.",
    });
  }
}

module.exports = {
  deleteSelectedRecords,
  requestDeleteAccountOtp,
  deleteAccount,
  purgeDueArchives,
};
