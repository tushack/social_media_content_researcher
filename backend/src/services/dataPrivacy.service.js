const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

const admin = require("../config/firebaseAdmin");
const supabase = require("../config/supabase");

const deleteAccountOtps = new Map();

const VALID_TARGETS = ["savedIdeas", "researchHistory", "savedThumbnails"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function makeOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function getTransporter() {
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();

  console.log("SMTP USER:", smtpUser);
  console.log("SMTP PASS LENGTH:", smtpPass.length);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function cleanTargets(targets = []) {
  return [...new Set(targets)].filter((target) => VALID_TARGETS.includes(target));
}

function toPlainJson(value) {
  return JSON.parse(JSON.stringify(value || null));
}

async function getFirestoreDocsByUser(collectionName, userId) {
  const db = admin.firestore();

  const snapshot = await db
    .collection(collectionName)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...toPlainJson(doc.data()),
  }));
}

async function deleteFirestoreDocsByUser(collectionName, userId) {
  const db = admin.firestore();

  const snapshot = await db
    .collection(collectionName)
    .where("userId", "==", userId)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return snapshot.size;
}

async function archiveTargetData({ userId, email, requestType, target, data }) {
  await supabase.from("data_deletion_archives").insert({
    user_id: userId,
    email,
    request_type: requestType,
    target,
    archive_json: data || {},
    status: "scheduled",
  });
}

async function requestRecordsDeletion({ userId, email, targets }) {
  const selectedTargets = cleanTargets(targets);

  if (!selectedTargets.length) {
    throw new Error("Please select at least one record type.");
  }

  const result = {
    savedIdeas: 0,
    researchHistory: 0,
    savedThumbnails: 0,
  };

  if (selectedTargets.includes("savedIdeas")) {
    const { data: savedIdeas, error } = await supabase
      .from("saved_ideas")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    await archiveTargetData({
      userId,
      email,
      requestType: "records",
      target: "savedIdeas",
      data: {
        records: savedIdeas || [],
        deletedFromActiveWorkspaceAt: new Date().toISOString(),
        scheduledPermanentPurgeAfterDays: 30,
      },
    });

    await supabase.from("saved_ideas").delete().eq("user_id", userId);

    result.savedIdeas = savedIdeas?.length || 0;
  }

  if (selectedTargets.includes("researchHistory")) {
    const { data: history, error } = await supabase
      .from("research_queries")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    await archiveTargetData({
      userId,
      email,
      requestType: "records",
      target: "researchHistory",
      data: {
        records: history || [],
        deletedFromActiveWorkspaceAt: new Date().toISOString(),
        scheduledPermanentPurgeAfterDays: 30,
      },
    });

    await supabase.from("research_queries").delete().eq("user_id", userId);

    result.researchHistory = history?.length || 0;
  }

  if (selectedTargets.includes("savedThumbnails")) {
    const thumbnails = await getFirestoreDocsByUser(
      "content_pack_thumbnails",
      userId
    );

    await archiveTargetData({
      userId,
      email,
      requestType: "records",
      target: "savedThumbnails",
      data: {
        records: thumbnails,
        cloudinaryPublicIds: thumbnails
          .map((item) => item.publicId)
          .filter(Boolean),
        deletedFromActiveWorkspaceAt: new Date().toISOString(),
        scheduledPermanentPurgeAfterDays: 30,
      },
    });

    await deleteFirestoreDocsByUser("content_pack_thumbnails", userId);

    result.savedThumbnails = thumbnails.length;
  }

  return {
    message:
      "Selected records removed from your active workspace. Permanent deletion is scheduled after 30 days.",
    selectedTargets,
    deletedFromActiveWorkspace: result,
    scheduledPermanentPurgeAfterDays: 30,
  };
}

async function sendDeleteAccountOtp({ userId, email }) {
  if (!email) {
    throw new Error("Email not found.");
  }

  const otp = makeOtp();

  deleteAccountOtps.set(userId, {
    otpHash: hashValue(otp),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your account deletion verification code",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Account Deletion Verification</h2>
        <p>Your 4-digit verification code is:</p>
        <div style="font-size:30px;font-weight:700;letter-spacing:8px;margin:20px 0;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  return {
    message: "4-digit verification code sent to your email.",
    email,
  };
}

async function confirmDeleteAccount({ userId, email, code }) {
  const otpData = deleteAccountOtps.get(userId);

  if (!otpData) {
    throw new Error("Please request verification code first.");
  }

  if (Date.now() > otpData.expiresAt) {
    deleteAccountOtps.delete(userId);
    throw new Error("Verification code expired. Please request a new code.");
  }

  if (otpData.attempts >= 5) {
    deleteAccountOtps.delete(userId);
    throw new Error("Too many wrong attempts. Please request a new code.");
  }

  if (hashValue(code) !== otpData.otpHash) {
    otpData.attempts += 1;
    deleteAccountOtps.set(userId, otpData);
    throw new Error("Invalid verification code.");
  }

  const db = admin.firestore();

  const { data: savedIdeas } = await supabase
    .from("saved_ideas")
    .select("*")
    .eq("user_id", userId);

  const { data: researchHistory } = await supabase
    .from("research_queries")
    .select("*")
    .eq("user_id", userId);

  const thumbnails = await getFirestoreDocsByUser(
    "content_pack_thumbnails",
    userId
  );

  const appUserRef = db.collection("app_users").doc(userId);
  const appUserDoc = await appUserRef.get();
  const profile = appUserDoc.exists ? toPlainJson(appUserDoc.data()) : null;

  await archiveTargetData({
    userId,
    email,
    requestType: "account",
    target: "fullAccount",
    data: {
      profile,
      savedIdeas: savedIdeas || [],
      researchHistory: researchHistory || [],
      savedThumbnails: thumbnails,
      cloudinaryPublicIds: [
        ...(thumbnails || []).map((item) => item.publicId).filter(Boolean),
        profile?.photoPublicId,
      ].filter(Boolean),
      accountClosedAt: new Date().toISOString(),
      deletedFromActiveWorkspaceAt: new Date().toISOString(),
      scheduledPermanentPurgeAfterDays: 30,
      note:
        "Data removed from active workspace now. Permanent purge scheduled after 30 days.",
    },
  });

  await supabase.from("saved_ideas").delete().eq("user_id", userId);
  await supabase.from("research_queries").delete().eq("user_id", userId);

  await deleteFirestoreDocsByUser("content_pack_thumbnails", userId);

  if (appUserDoc.exists) {
    await db.collection("app_users_deleted").doc(userId).set(
      {
        ...profile,
        status: "account_deleted",
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        scheduledPermanentPurgeAfterDays: 30,
      },
      { merge: true }
    );

    await appUserRef.delete();
  }

  await admin.auth().deleteUser(userId);

  deleteAccountOtps.delete(userId);

  return {
    message:
      "Account removed from active access. Permanent deletion is scheduled after  days.",
    accountDeleted: true,
    scheduledPermanentPurgeAfterDays: 30,
  };
}

async function purgeDueDeletionArchives() {
  const now = new Date().toISOString();

  const { data: dueItems, error } = await supabase
    .from("data_deletion_archives")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_purge_at", now)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  let purged = 0;

  for (const item of dueItems || []) {
    try {
      const publicIds = item.archive_json?.cloudinaryPublicIds || [];

      for (const publicId of publicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      await supabase
        .from("data_deletion_archives")
        .update({
          status: "purged",
          purged_at: new Date().toISOString(),
          archive_json: {
            purged: true,
            purgedAt: new Date().toISOString(),
            originalTarget: item.target,
          },
        })
        .eq("id", item.id);

      purged += 1;
    } catch (error) {
      await supabase
        .from("data_deletion_archives")
        .update({
          status: "failed",
          error_message: error.message,
        })
        .eq("id", item.id);
    }
  }

  return {
    purged,
  };
}

module.exports = {
  requestRecordsDeletion,
  sendDeleteAccountOtp,
  confirmDeleteAccount,
  purgeDueDeletionArchives,
};