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


export async function getDailyNicheIdeas({
  niche = "",
  platform = "YouTube",
  audience = "New creators",
  limit = 20,
  forceRefresh = false,
} = {}) {
  const params = new URLSearchParams();

  if (niche) params.set("niche", niche);
  if (platform) params.set("platform", platform);
  if (audience) params.set("audience", audience);

  params.set("limit", String(limit));
  params.set("forceRefresh", forceRefresh ? "true" : "false");

  const response = await fetch(`${API_BASE_URL}/research/daily?${params}`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch daily niche ideas");
  }

  return data;
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

export async function deleteSelectedRecords(targets) {
  const response = await fetch(`${API_BASE_URL}/data-privacy/delete-records`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ targets }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete selected records");
  }

  return data;
}

export async function requestDeleteAccountOtp() {
  const response = await fetch(
    `${API_BASE_URL}/data-privacy/delete-account-code`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to send verification code");
  }

  return data;
}

export async function confirmDeleteAccount(code) {
  const response = await fetch(`${API_BASE_URL}/data-privacy/delete-account`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete account");
  }

  return data;
}

export async function getYoutubeAuthUrl() {
  const response = await fetch(`${API_BASE_URL}/youtube/auth-url`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to start YouTube connect.");
  }

  return data;
}

export async function getYoutubeConnection() {
  const response = await fetch(`${API_BASE_URL}/youtube/connection`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch YouTube connection.");
  }

  return data;
}

export async function applyYoutubeReadyKit(payload) {
  const response = await fetch(`${API_BASE_URL}/youtube/apply-kit`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to apply YouTube Ready Kit.");
  }

  return data;
}