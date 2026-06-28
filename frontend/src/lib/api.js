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

export async function getTopYouTubeChannels({
  niche,
  limit = 4,
} = {}) {
  const cleanNiche = String(niche || "").trim();

  if (!cleanNiche) {
    throw new Error("Niche is required to load YouTube channels.");
  }

  const params = new URLSearchParams({
    niche: cleanNiche,
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/research/top-channels?${params.toString()}`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch YouTube channels.");
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

export async function analyzeViralPotential(payload) {
  const response = await fetch(`${API_BASE_URL}/viral-check/analyze`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to analyze viral potential");
  }

  return data;
}


export async function getTrendFeed(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/trends/feed?${params}`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to load live trends.");
  }

  return data;
}

export async function searchTrendTopics(payload) {
  const response = await fetch(`${API_BASE_URL}/trends/search`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to search live trends.");
  }

  return data;
}


function getDownloadFileName(contentDisposition, fallbackName) {
  const encodedMatch = String(contentDisposition || "").match(
    /filename\*=UTF-8''([^;]+)/i
  );

  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return fallbackName;
    }
  }

  const normalMatch = String(contentDisposition || "").match(
    /filename="?([^";]+)"?/i
  );

  return normalMatch?.[1] || fallbackName;
}

export async function previewYoutubeVideo(payload) {
  const response = await fetch(`${API_BASE_URL}/media-exports/youtube-preview`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not load YouTube preview.");
  }

  return data;
}

export async function convertOwnedMedia({
  file,
  outputType,
  videoQuality,
  audioBitrate,
  rightsAcknowledged,
  youtubeUrl,
  youtubeVideoId,
  youtubeTitle,
  onUploadProgress,
}) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Please login first.");
  }

  if (!file) {
    throw new Error("Upload your original video file first.");
  }

  const token = await currentUser.getIdToken();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("outputType", outputType || "video");
  formData.append("videoQuality", videoQuality || "original");
  formData.append("audioBitrate", String(audioBitrate || 192));
  formData.append("rightsAcknowledged", String(Boolean(rightsAcknowledged)));
  formData.append("youtubeUrl", youtubeUrl || "");
  formData.append("youtubeVideoId", youtubeVideoId || "");
  formData.append("youtubeTitle", youtubeTitle || "");

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", `${API_BASE_URL}/media-exports/convert`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || typeof onUploadProgress !== "function") {
        return;
      }

      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => {
      reject(new Error("Network error while uploading your original video."));
    };

    request.onload = () => {
      let data = {};

      try {
        data = request.responseText ? JSON.parse(request.responseText) : {};
      } catch {
        data = {};
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(data.message || "Could not export this media file."));
        return;
      }

      resolve(data);
    };

    request.send(formData);
  });
}

export async function getMediaExports() {
  const response = await fetch(`${API_BASE_URL}/media-exports`, {
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not load media export history.");
  }

  return data;
}

export async function downloadMediaExport(item) {
  const response = await fetch(
    `${API_BASE_URL}/media-exports/${item.id}/download`,
    {
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Could not download this media export.");
  }

  const fileBlob = await response.blob();
  const objectUrl = URL.createObjectURL(fileBlob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = getDownloadFileName(
    response.headers.get("content-disposition"),
    item.outputName || "media-export"
  );

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function deleteMediaExport(exportId) {
  const response = await fetch(`${API_BASE_URL}/media-exports/${exportId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not delete media export.");
  }

  return data;
}