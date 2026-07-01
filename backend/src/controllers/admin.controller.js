const {
  getAdminOverview,
  getAdminUsers,
  getAdminUserDetail,
  setFirebaseUserDisabled,
  addAdminUserNote,
  getAdminActivity,
  getAdminCalendarEvents,
  getAdminMediaExports,
} = require("../services/admin.service");

const { logActivitySafe } = require("../services/activityLog.service");

function sendError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    message: error.message || fallbackMessage,
  });
}

async function getAdminSummary(req, res) {
  try {
    const result = await getAdminOverview({
      days: req.query?.days,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin overview error:", error);
    return sendError(res, error, "Could not load admin overview.");
  }
}

async function listAdminUsers(req, res) {
  try {
    const result = await getAdminUsers({
      search: req.query?.search,
      page: req.query?.page,
      limit: req.query?.limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin users error:", error);
    return sendError(res, error, "Could not load users.");
  }
}

async function getAdminUser(req, res) {
  try {
    const result = await getAdminUserDetail(req.params.userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin user detail error:", error);
    return sendError(res, error, "Could not load user details.");
  }
}

async function updateAdminUserStatus(req, res) {
  try {
    const targetUserId = String(req.params.userId || "").trim();
    const disabled = Boolean(req.body?.disabled);

    if (!targetUserId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (targetUserId === req.user.uid && disabled) {
      return res.status(400).json({
        message: "You cannot disable the account currently used for admin access.",
      });
    }

    const user = await setFirebaseUserDisabled({
      userId: targetUserId,
      disabled,
    });

    await logActivitySafe({
      userId: targetUserId,
      userEmail: user.email,
      eventType: disabled ? "admin.user_disabled" : "admin.user_enabled",
      module: "admin",
      entityId: targetUserId,
      metadata: {
        performedByUserId: req.user.uid,
        performedByEmail: req.user.email,
      },
      req,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Admin user status error:", error);
    return sendError(res, error, "Could not update user status.");
  }
}

async function createAdminUserNote(req, res) {
  try {
    const note = await addAdminUserNote({
      userId: req.params.userId,
      note: req.body?.note,
      createdByUserId: req.user.uid,
      createdByEmail: req.user.email,
    });

    await logActivitySafe({
      userId: req.params.userId,
      eventType: "admin.note_added",
      module: "admin",
      entityId: note.id,
      metadata: {
        performedByUserId: req.user.uid,
        performedByEmail: req.user.email,
      },
      req,
    });

    return res.status(201).json({ note });
  } catch (error) {
    console.error("Admin user note error:", error);
    return sendError(res, error, "Could not save admin note.");
  }
}

async function listAdminActivity(req, res) {
  try {
    const result = await getAdminActivity({
      page: req.query?.page,
      limit: req.query?.limit,
      module: req.query?.module,
      status: req.query?.status,
      userId: req.query?.userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin activity error:", error);
    return sendError(res, error, "Could not load activity logs.");
  }
}

async function listAdminCalendarEvents(req, res) {
  try {
    const result = await getAdminCalendarEvents({
      page: req.query?.page,
      limit: req.query?.limit,
      status: req.query?.status,
      userId: req.query?.userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin calendar events error:", error);
    return sendError(res, error, "Could not load calendar plans.");
  }
}

async function listAdminMediaExports(req, res) {
  try {
    const result = await getAdminMediaExports({
      page: req.query?.page,
      limit: req.query?.limit,
      userId: req.query?.userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Admin media exports error:", error);
    return sendError(res, error, "Could not load media exports.");
  }
}

module.exports = {
  getAdminSummary,
  listAdminUsers,
  getAdminUser,
  updateAdminUserStatus,
  createAdminUserNote,
  listAdminActivity,
  listAdminCalendarEvents,
  listAdminMediaExports,
};
