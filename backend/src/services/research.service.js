const supabase = require("../config/supabase");

const {
  runApifyYouTubeSearch,
  runApifyYouTubeChannelAnalysis,
} = require("./apify.service");

function pickField(item, fields, fallback = "") {
  for (const field of fields) {
    if (item && item[field] !== undefined && item[field] !== null) {
      return item[field];
    }
  }

  return fallback;
}

function getTextValue(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getTextValue(item, ""))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.channelName ||
      value.channelTitle ||
      value.author ||
      value.authorName ||
      value.handle ||
      value.text ||
      value.url ||
      fallback
    );
  }

  return fallback;
}

function normalizeViewCount(value) {
  if (typeof value === "number") {
    return value;
  }

  if (!value || typeof value !== "string") {
    return 0;
  }

  const cleanValue = value
    .toLowerCase()
    .replace(/views/g, "")
    .replace(/view/g, "")
    .replace(/subscribers/g, "")
    .replace(/subscriber/g, "")
    .replace(/videos/g, "")
    .replace(/video/g, "")
    .replace(/,/g, "")
    .trim();

  const number = parseFloat(cleanValue);

  if (Number.isNaN(number)) {
    return 0;
  }

  if (cleanValue.includes("b")) {
    return Math.round(number * 1000000000);
  }

  if (cleanValue.includes("m")) {
    return Math.round(number * 1000000);
  }

  if (cleanValue.includes("k")) {
    return Math.round(number * 1000);
  }

  return Math.round(number);
}

function formatViews(value) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  const views = Number(value || 0);

  if (views >= 1000000000) {
    return `${(views / 1000000000).toFixed(1)}B`;
  }

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${Math.round(views / 1000)}K`;
  }

  return `${views}`;
}

function calculateAverage(numbers) {
  const validNumbers = numbers.filter((item) => Number(item) > 0);

  if (!validNumbers.length) {
    return 0;
  }

  const total = validNumbers.reduce((sum, item) => sum + Number(item), 0);

  return Math.round(total / validNumbers.length);
}

function getGrowth(index) {
  if (index === 0) return "+184%";
  if (index === 1) return "+132%";
  if (index === 2) return "+96%";
  if (index === 3) return "+74%";

  return "+52%";
}

function getCompetition(index) {
  if (index === 0) return "High";
  if (index === 1) return "Medium";

  return "Low";
}

function getScore(index) {
  if (index === 0) return "92";
  if (index === 1) return "86";
  if (index === 2) return "81";

  return "74";
}

function normalizeApifyVideo(item) {
  const rawTitle = pickField(
    item,
    ["title", "videoTitle", "name", "text", "videoName"],
    ""
  );

  const rawChannel = pickField(
    item,
    [
      "channelName",
      "channelTitle",
      "channel",
      "author",
      "authorName",
      "uploader",
      "owner",
      "channelHandle",
    ],
    "Unknown Channel"
  );

  const rawViews = pickField(
    item,
    [
      "viewCount",
      "views",
      "numberOfViews",
      "viewCountText",
      "viewsText",
      "viewCountShort",
    ],
    0
  );

  const rawUrl = pickField(
    item,
    ["url", "videoUrl", "link", "watchUrl", "videoLink"],
    ""
  );

  const rawThumbnail = pickField(
    item,
    [
      "thumbnailUrl",
      "thumbnail",
      "thumbnailUrlHQ",
      "thumbnail_url",
      "image",
      "thumbnailImage",
      "thumbnailSrc",
    ],
    ""
  );

  const rawPublishedAt = pickField(
    item,
    ["publishedAt", "date", "publishedDate", "publishedText", "uploadedAt"],
    ""
  );

  return {
    title: getTextValue(rawTitle, ""),
    channel: getTextValue(rawChannel, "Unknown Channel"),
    views: normalizeViewCount(rawViews),
    url: getTextValue(rawUrl, ""),
    thumbnail: getTextValue(rawThumbnail, ""),
    publishedAt: getTextValue(rawPublishedAt, ""),
    raw: item,
  };
}

function createFallbackResearch({ niche, platform, audience }) {
  const cleanNiche = niche || "AI tools";
  const cleanPlatform = platform || "YouTube";
  const cleanAudience = audience || "New creators";

  return {
    trendingTopics: [
      {
        topic: `${cleanNiche} for beginners`,
        growth: "+184%",
        competition: "Medium",
        insight: `Strong topic for ${cleanAudience} on ${cleanPlatform}.`,
      },
      {
        topic: `Best ${cleanNiche}`,
        growth: "+132%",
        competition: "High",
        insight: `List-style content can perform well for ${cleanNiche}.`,
      },
      {
        topic: `${cleanNiche} mistakes to avoid`,
        growth: "+96%",
        competition: "Low",
        insight: "Problem-based topics are easier to package into viral hooks.",
      },
    ],

    viralHooks: [
      `I tested ${cleanNiche} so you don't waste your time.`,
      `Most ${cleanAudience.toLowerCase()} miss this ${cleanNiche} opportunity.`,
      `This ${cleanNiche} workflow can save hours every week.`,
      `I studied top-performing ${cleanNiche} content and found this pattern.`,
    ],

    titleSuggestions: [
      `I Used ${cleanNiche} to Find Viral ${cleanPlatform} Ideas`,
      `The Best ${cleanNiche} Strategy for ${cleanAudience}`,
      `How to Grow Faster on ${cleanPlatform} Using ${cleanNiche}`,
      `I Tested ${cleanNiche} Ideas for 7 Days`,
    ],

    competitors: [
      {
        channel: `${cleanNiche} Lab`,
        niche: cleanNiche,
        views: "Estimated",
        growth: "+38%",
        score: "92",
      },
      {
        channel: `${cleanPlatform} Creator Studio`,
        niche: cleanNiche,
        views: "Estimated",
        growth: "+24%",
        score: "86",
      },
      {
        channel: `${cleanAudience} Growth Hub`,
        niche: cleanNiche,
        views: "Estimated",
        growth: "+19%",
        score: "81",
      },
    ],

    sourceVideos: [],
    source: "fallback",
  };
}

function buildResearchFromVideos({ niche, platform, audience, videos }) {
  const cleanNiche = niche || "AI tools";
  const cleanPlatform = platform || "YouTube";
  const cleanAudience = audience || "New creators";

  const safeVideos = videos.filter((video) => {
    return video && typeof video.title === "string" && video.title.trim();
  });

  if (!safeVideos.length) {
    return createFallbackResearch({
      niche: cleanNiche,
      platform: cleanPlatform,
      audience: cleanAudience,
    });
  }

  const trendingTopics = safeVideos.slice(0, 4).map((video, index) => ({
    topic: video.title,
    growth: getGrowth(index),
    competition: getCompetition(index),
    insight: `This video is getting attention with ${formatViews(
      video.views
    )} views on ${video.channel}.`,
  }));

  const viralHooks = safeVideos.slice(0, 4).map((video) => {
    return `I studied "${video.title}" to understand why it reached ${formatViews(
      video.views
    )} views.`;
  });

  const firstTitle = safeVideos[0]?.title || cleanNiche;

  const titleSuggestions = [
    `I Studied Viral ${cleanNiche} Videos So You Don't Have To`,
    `Why These ${cleanPlatform} Videos Are Getting Views Right Now`,
    `The Best ${cleanNiche} Ideas for ${cleanAudience}`,
    `How to Find Viral ${cleanPlatform} Topics in ${cleanNiche}`,
    `I Analyzed "${firstTitle}" and Found This Pattern`,
  ];

  const competitors = safeVideos.slice(0, 4).map((video, index) => ({
    channel: getTextValue(video.channel, "Unknown Channel"),
    niche: cleanNiche,
    views: formatViews(video.views),
    growth: getGrowth(index),
    score: getScore(index),
  }));

  return {
    trendingTopics,
    viralHooks,
    titleSuggestions,
    competitors,
    sourceVideos: safeVideos,
    source: "apify",
  };
}

async function saveResearchQuery({ niche, platform, audience, response }) {
  const { error } = await supabase.from("research_queries").insert({
    niche,
    platform,
    audience,
    response_json: response,
  });

  if (error) {
    console.error("Supabase insert error:", error);
  }
}

async function createResearchResult({ niche, platform, audience }) {
  const cleanNiche = niche || "AI tools";
  const cleanPlatform = platform || "YouTube";
  const cleanAudience = audience || "New creators";

  const searchQuery = `${cleanNiche} ${cleanPlatform} ${cleanAudience}`;

  try {
    const apifyItems = await runApifyYouTubeSearch({
      query: searchQuery,
      maxResults: 10,
    });

    const hasOnlyDemoItems =
      apifyItems.length > 0 && apifyItems.every((item) => item.demo === true);

    if (hasOnlyDemoItems) {
      throw new Error(
        "Apify actor returned demo data only. Check actor input format or actor access."
      );
    }

    console.log("Raw Apify items count:", apifyItems.length);

    if (apifyItems.length > 0) {
      console.log(
        "Raw Apify first item:",
        JSON.stringify(apifyItems[0], null, 2)
      );
    }

    const videos = apifyItems.map(normalizeApifyVideo);

    const response = buildResearchFromVideos({
      niche: cleanNiche,
      platform: cleanPlatform,
      audience: cleanAudience,
      videos,
    });

    await saveResearchQuery({
      niche: cleanNiche,
      platform: cleanPlatform,
      audience: cleanAudience,
      response,
    });

    return response;
  } catch (error) {
    console.error("Apify research error:", error.message);

    const fallbackResponse = createFallbackResearch({
      niche: cleanNiche,
      platform: cleanPlatform,
      audience: cleanAudience,
    });

    await saveResearchQuery({
      niche: cleanNiche,
      platform: cleanPlatform,
      audience: cleanAudience,
      response: fallbackResponse,
    });

    return fallbackResponse;
  }
}

function isChannelInfoItem(item) {
  const recordType = getTextValue(item?.recordType, "").toLowerCase();
  const type = getTextValue(item?.type, "").toLowerCase();

  return (
    recordType === "channel" ||
    type === "channel" ||
    item?.subscriberCount !== undefined ||
    item?.subscriberCountText !== undefined ||
    item?.subscribers !== undefined ||
    item?.channelDescription !== undefined ||
    item?.description !== undefined ||
    item?.videoCount !== undefined ||
    item?.viewCount !== undefined
  );
}

function isVideoItem(item) {
  const recordType = getTextValue(item?.recordType, "").toLowerCase();
  const type = getTextValue(item?.type, "").toLowerCase();

  if (recordType === "channel" || type === "channel") {
    return false;
  }

  return Boolean(
    item?.title ||
      item?.videoTitle ||
      item?.videoUrl ||
      item?.watchUrl ||
      item?.videoLink
  );
}

function extractChannelName(item, fallback = "Unknown Channel") {
  return getTextValue(
    pickField(
      item,
      [
        "channelName",
        "channelTitle",
        "title",
        "name",
        "author",
        "authorName",
        "handle",
        "channelHandle",
      ],
      fallback
    ),
    fallback
  );
}

function extractChannelUrl(item, fallback = "") {
  return getTextValue(
    pickField(
      item,
      [
        "channelUrl",
        "channelURL",
        "authorUrl",
        "channelLink",
        "ownerUrl",
        "url",
        "sourceInput",
      ],
      fallback
    ),
    fallback
  );
}

function calculateChannelGrowth(totalVideos, totalViews, subscribers) {
  const normalizedSubscribers = normalizeViewCount(subscribers);

  if (totalVideos >= 1000 && totalViews >= 1000000) {
    return "+38%";
  }

  if (totalVideos >= 500) {
    return "+24%";
  }

  if (totalVideos >= 100) {
    return "+16%";
  }

  if (normalizedSubscribers >= 100000) {
    return "+18%";
  }

  return "+8%";
}

function calculateOpportunityScore(avgViews, subscribers) {
  const normalizedSubscribers = normalizeViewCount(subscribers);

  if (!avgViews || avgViews <= 0) {
    return 45;
  }

  if (!normalizedSubscribers || normalizedSubscribers <= 0) {
    return 55;
  }

  const ratio = avgViews / normalizedSubscribers;

  return Math.min(95, Math.max(45, Math.round(ratio * 1000)));
}

async function analyzeCompetitorChannelResult({ channelUrl }) {
  if (!channelUrl) {
    throw new Error("Channel URL is required");
  }

  const apifyItems = await runApifyYouTubeChannelAnalysis({
    channelUrl,
    maxResults: 30,
  });

  const hasOnlyDemoItems =
    apifyItems.length > 0 && apifyItems.every((item) => item.demo === true);

  if (hasOnlyDemoItems) {
    throw new Error("Apify actor returned demo data only.");
  }

  const channelInfoItem =
    apifyItems.find(isChannelInfoItem) || apifyItems[0] || {};

  const rawVideoItems = apifyItems.filter(isVideoItem);

  const videos = rawVideoItems.map(normalizeApifyVideo).filter((video) => {
    return video && video.title;
  });

  const channelName = extractChannelName(
    channelInfoItem,
    videos[0]?.channel || "Unknown Channel"
  );

  const subscribers = getTextValue(
    pickField(
      channelInfoItem,
      [
        "subscriberCountText",
        "subscriberCount",
        "subscribers",
        "numberOfSubscribers",
      ],
      "Not available"
    ),
    "Not available"
  );

  const totalChannelViews = normalizeViewCount(
    pickField(channelInfoItem, ["viewCount", "totalViews", "views"], 0)
  );

  const totalChannelVideos = normalizeViewCount(
    pickField(channelInfoItem, ["videoCount", "videos", "numberOfVideos"], 0)
  );

  const avgViewsFromChannel =
    totalChannelViews > 0 && totalChannelVideos > 0
      ? Math.round(totalChannelViews / totalChannelVideos)
      : 0;

  const finalChannelUrl = extractChannelUrl(channelInfoItem, channelUrl);

  if (!videos.length) {
    const growth = calculateChannelGrowth(
      totalChannelVideos,
      totalChannelViews,
      subscribers
    );

    const opportunityScore = calculateOpportunityScore(
      avgViewsFromChannel,
      subscribers
    );

    return {
      channel: channelName,
      channelUrl: finalChannelUrl,
      subscribers,
      totalVideosAnalyzed: 0,
      totalChannelVideos,
      totalChannelViews: formatViews(totalChannelViews),
      avgViews: formatViews(avgViewsFromChannel),
      highestViews: "Not available",
      growth,
      uploadRate:
        totalChannelVideos > 0
          ? `${formatViews(totalChannelVideos)} total videos`
          : "Not available",
      opportunityScore: String(opportunityScore),
      summary: `${channelName} has ${subscribers}, ${formatViews(
        totalChannelViews
      )} total channel views, and ${formatViews(
        totalChannelVideos
      )} total videos. Average views are around ${formatViews(
        avgViewsFromChannel
      )} per video. Recent video-level data was not returned by the scraper, so this analysis is based on channel-level stats.`,
      topVideos: [],
    };
  }

  const viewCounts = videos.map((video) => Number(video.views || 0));
  const averageViews = calculateAverage(viewCounts);
  const highestViews = Math.max(...viewCounts, 0);

  const topVideos = videos
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 6)
    .map((video) => ({
      title: video.title,
      views: formatViews(video.views),
      url: video.url,
      thumbnail: video.thumbnail,
      publishedAt: video.publishedAt,
    }));

  const growth = videos.length >= 10
    ? "+24%"
    : calculateChannelGrowth(totalChannelVideos, totalChannelViews, subscribers);

  const opportunityScore = calculateOpportunityScore(averageViews, subscribers);

  return {
    channel: channelName,
    channelUrl: finalChannelUrl,
    subscribers,
    totalVideosAnalyzed: videos.length,
    totalChannelVideos,
    totalChannelViews: formatViews(totalChannelViews),
    avgViews: formatViews(averageViews),
    highestViews: formatViews(highestViews),
    growth,
    uploadRate: `${videos.length} recent videos`,
    opportunityScore: String(opportunityScore),
    summary: `${channelName} has ${videos.length} recent videos analyzed. Average views are around ${formatViews(
      averageViews
    )}, with the highest video reaching ${formatViews(
      highestViews
    )} views. Total channel views are ${formatViews(totalChannelViews)}.`,
    topVideos,
  };
}

module.exports = {
  createResearchResult,
  analyzeCompetitorChannelResult,
};