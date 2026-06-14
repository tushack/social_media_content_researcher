const supabase = require("../config/supabase");
const { createResearchResult } = require("./research.service");

function parseResponseJson(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return null;
}

function isSameDay(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

async function getLatestResearch({ userId, niche }) {
  let query = supabase
    .from("research_queries")
    .select("id, niche, platform, audience, response_json, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (niche) {
    query = query.eq("niche", niche);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function getDailyNicheIdeasService({
  userId,
  niche,
  platform = "YouTube",
  audience = "New creators",
  limit = 20,
  forceRefresh = false,
}) {
  const requestedNiche = String(niche || "").trim();

  const latestAnyResearch = requestedNiche
    ? null
    : await getLatestResearch({ userId });

  const finalNiche = requestedNiche || latestAnyResearch?.niche || "";

  if (!finalNiche) {
    return {
      niche: "",
      platform,
      audience,
      trendingTopics: [],
      viralHooks: [],
      titleSuggestions: [],
      competitors: [],
      source: "empty",
      meta: {
        needsNiche: true,
        isCached: false,
        message: "Set your niche to start Daily Niche Radar.",
      },
    };
  }

  const latestNicheResearch = await getLatestResearch({
    userId,
    niche: finalNiche,
  });

  const latestResponse = parseResponseJson(latestNicheResearch?.response_json);

  const hasEnoughTopics =
    Array.isArray(latestResponse?.trendingTopics) &&
    latestResponse.trendingTopics.length >= Math.min(Number(limit) || 20, 4);

  if (!forceRefresh && latestNicheResearch && latestResponse && hasEnoughTopics) {
    return {
      ...latestResponse,
      niche: finalNiche,
      platform: latestNicheResearch.platform || platform,
      audience: latestNicheResearch.audience || audience,
      meta: {
        ...(latestResponse.meta || {}),
        niche: finalNiche,
        platform: latestNicheResearch.platform || platform,
        audience: latestNicheResearch.audience || audience,
        isCached: true,
        latestQueryId: latestNicheResearch.id,
        generatedAt: latestNicheResearch.created_at,
        isFromToday: isSameDay(latestNicheResearch.created_at),
      },
    };
  }

  return createResearchResult({
    niche: finalNiche,
    platform,
    audience,
    userId,
    maxTopics: Number(limit) || 20,
  });
}

module.exports = {
  getDailyNicheIdeasService,
};
