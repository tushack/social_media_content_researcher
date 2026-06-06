import { auth } from "./firebase";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthHeaders() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Please login first.");
  }

  const token = await currentUser.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function generateResearch(payload) {
  const response = await fetch(`${API_BASE_URL}/research/generate`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate research");
  }

  return data;
}

export async function getSavedIdeas() {
  const response = await fetch(`${API_BASE_URL}/saved-ideas`, {
    headers: await getAuthHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch saved ideas");
  }

  return data;
}

export async function saveIdea(payload) {
  const response = await fetch(`${API_BASE_URL}/saved-ideas`, {
    method: "POST",
    headers: await getAuthHeaders(),
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
    headers: await getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete idea");
  }

  return data;
}

export async function getResearchHistory() {
  const response = await fetch(`${API_BASE_URL}/research/history`, {
    headers: await getAuthHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch research history");
  }

  return data;
}

export async function analyzeCompetitorChannel(payload) {
  const response = await fetch(`${API_BASE_URL}/research/analyze-channel`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to analyze competitor channel");
  }

  return data;
}

export async function createContentPack(payload) {
  const response = await fetch(`${API_BASE_URL}/research/content-pack`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create content pack");
  }

  return data;
}

export async function generateAiThumbnail(payload) {
  const response = await fetch(`${API_BASE_URL}/research/thumbnail`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate AI thumbnail");
  }

  return data;
}