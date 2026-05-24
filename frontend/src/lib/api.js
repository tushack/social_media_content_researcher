const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function generateResearch(payload) {
  const response = await fetch(`${API_BASE_URL}/research/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate research");
  }

  return data;
}

export async function getSavedIdeas() {
  const response = await fetch(`${API_BASE_URL}/saved-ideas`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch saved ideas");
  }

  return data;
}

export async function saveIdea(payload) {
  const response = await fetch(`${API_BASE_URL}/saved-ideas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save idea");
  }

  return data;
}

export async function deleteSavedIdea(id) {
  const response = await fetch(`${API_BASE_URL}/saved-ideas/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete idea");
  }

  return data;
}

export async function getResearchHistory() {
  const response = await fetch(`${API_BASE_URL}/research/history`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch research history");
  }

  return data;
}

export async function analyzeCompetitorChannel(payload) {
  const response = await fetch(`${API_BASE_URL}/research/analyze-channel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to analyze competitor channel");
  }

  return data;
}