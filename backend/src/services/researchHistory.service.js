const supabase = require("../config/supabase");

async function getResearchHistoryService() {
  const { data, error } = await supabase
    .from("research_queries")
    .select("id, niche, platform, audience, response_json, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return data || [];
}

module.exports = {
  getResearchHistoryService,
};