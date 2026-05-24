const supabase = require("../config/supabase");

async function createSavedIdeaService(payload) {
  const { data, error } = await supabase
    .from("saved_ideas")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getSavedIdeasService() {
  const { data, error } = await supabase
    .from("saved_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

async function deleteSavedIdeaService(id) {
  const { error } = await supabase
    .from("saved_ideas")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

module.exports = {
  createSavedIdeaService,
  getSavedIdeasService,
  deleteSavedIdeaService,
};