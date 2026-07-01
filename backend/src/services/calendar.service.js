const supabase = require("../config/supabase");

const ALLOWED_STATUSES = new Set([
  "Ideas",
  "Scripting",
  "Recording",
  "Editing",
  "Scheduled",
  "Posted",
]);

const ALLOWED_REMINDERS = new Set([10, 30, 60, 1440]);

function cleanText(value, maxLength = 1000) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeDate(value) {
  const date = cleanText(value, 20);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createHttpError("A valid calendar date is required.");
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError("A valid calendar date is required.");
  }

  return date;
}

function normalizeTime(value) {
  const time = cleanText(value || "10:00", 10);

  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    throw createHttpError("A valid calendar time is required.");
  }

  return time.slice(0, 5);
}

function normalizePayload(payload = {}) {
  const title = cleanText(payload.title, 280);

  if (!title) {
    throw createHttpError("Content topic is required.");
  }

  const status = cleanText(payload.status || "Ideas", 40);

  if (!ALLOWED_STATUSES.has(status)) {
    throw createHttpError("Invalid content plan status.");
  }

  const reminderMinutes = Number(payload.reminderMinutes ?? payload.reminder_minutes ?? 30);

  if (!ALLOWED_REMINDERS.has(reminderMinutes)) {
    throw createHttpError("Invalid reminder time.");
  }

  return {
    title,
    scheduled_date: normalizeDate(payload.date ?? payload.scheduled_date),
    scheduled_time: normalizeTime(payload.time ?? payload.scheduled_time),
    platform: cleanText(payload.platform || "YouTube", 80) || "YouTube",
    status,
    reminder_minutes: reminderMinutes,
    notified: Boolean(payload.notified),
  };
}

function serializeCalendarEvent(record) {
  if (!record) return null;

  return {
    id: record.id,
    title: record.title,
    date: record.scheduled_date,
    time: String(record.scheduled_time || "10:00").slice(0, 5),
    platform: record.platform,
    status: record.status,
    reminderMinutes: Number(record.reminder_minutes || 30),
    notified: Boolean(record.notified),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function getCalendarEventsForUser(userId) {
  const { data, error } = await supabase
    .from("content_calendar_events")
    .select(
      "id, title, scheduled_date, scheduled_time, platform, status, reminder_minutes, notified, created_at, updated_at"
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true })
    .limit(500);

  if (error) {
    throw error;
  }

  return (data || []).map(serializeCalendarEvent);
}

async function createCalendarEventForUser({ userId, payload }) {
  const eventData = normalizePayload(payload);

  const { data, error } = await supabase
    .from("content_calendar_events")
    .insert({
      user_id: userId,
      ...eventData,
    })
    .select(
      "id, title, scheduled_date, scheduled_time, platform, status, reminder_minutes, notified, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return serializeCalendarEvent(data);
}

async function updateCalendarEventForUser({ userId, eventId, payload }) {
  const eventData = normalizePayload(payload);

  const { data, error } = await supabase
    .from("content_calendar_events")
    .update(eventData)
    .eq("id", eventId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select(
      "id, title, scheduled_date, scheduled_time, platform, status, reminder_minutes, notified, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw createHttpError("Content plan was not found.", 404);
  }

  return serializeCalendarEvent(data);
}

async function deleteCalendarEventForUser({ userId, eventId }) {
  const { data, error } = await supabase
    .from("content_calendar_events")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    })
    .eq("id", eventId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select(
      "id, title, scheduled_date, scheduled_time, platform, status, reminder_minutes, notified, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw createHttpError("Content plan was not found.", 404);
  }

  return serializeCalendarEvent(data);
}

module.exports = {
  getCalendarEventsForUser,
  createCalendarEventForUser,
  updateCalendarEventForUser,
  deleteCalendarEventForUser,
};
