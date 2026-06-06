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

async function saveResearchQuery({
  niche,
  platform,
  audience,
  response,
  userId,
}) {
  const { error } = await supabase.from("research_queries").insert({
    user_id: userId,
    niche,
    platform,
    audience,
    response_json: response,
  });

  if (error) {
    console.error("Supabase insert error:", error);
  }
}

async function createResearchResult({ niche, platform, audience, userId }) {
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
      userId,
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
      response,
      userId,
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

function cleanString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function limitText(text, length) {
  const value = cleanString(text);
  if (value.length <= length) return value;
  return `${value.slice(0, length).trim()}...`;
}

function createSlugWords(text, maxWords = 5) {
  return cleanString(text)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, maxWords);
}

function getContentPackAngle(competition) {
  const value = cleanString(competition, "Medium").toLowerCase();

  if (value === "low") {
    return {
      title: "Low Competition Opportunity",
      thumbnailHeadline: "LOW COMPETITION",
      posterTitle: "Create This Before Everyone Finds It",
      hookPrefix: "Most creators are still ignoring this topic",
      badgeColorText: "Low Competition",
      urgency: "early-mover",
    };
  }

  if (value === "high") {
    return {
      title: "High Demand Topic",
      thumbnailHeadline: "TRENDING NOW",
      posterTitle: "This Topic Is Already Exploding",
      hookPrefix: "This topic is already getting attention",
      badgeColorText: "High Demand",
      urgency: "high-demand",
    };
  }

  return {
    title: "Fast Growing Topic",
    thumbnailHeadline: "VIRAL IDEA",
    posterTitle: "This Idea Can Grow Fast",
    hookPrefix: "This topic is gaining momentum",
    badgeColorText: "Growing Fast",
    urgency: "fast-growth",
  };
}

function buildContentPack({ topic, growth, competition, insight, niche, platform, audience }) {
  const cleanTopic = cleanString(topic, "Viral YouTube Topic");
  const cleanGrowth = cleanString(growth, "+72%");
  const cleanCompetition = cleanString(competition, "Medium");
  const cleanInsight = cleanString(
    insight,
    "This topic has strong creator demand and can perform well with the right content angle."
  );
  const cleanNiche = cleanString(niche, "content creators");
  const cleanPlatform = cleanString(platform, "YouTube");
  const cleanAudience = cleanString(audience, "New creators");

  const angle = getContentPackAngle(cleanCompetition);
  const shortTopic = limitText(cleanTopic, 46);
  const thumbnailTopic = limitText(cleanTopic, 36);
  const lowerCompetition = cleanCompetition.toLowerCase();
  const hashtagWords = createSlugWords(cleanTopic, 5);

  return {
    topic: cleanTopic,
    growth: cleanGrowth,
    competition: cleanCompetition,
    insight: cleanInsight,
    niche: cleanNiche,
    platform: cleanPlatform,
    audience: cleanAudience,

    angle: angle.title,
    videoTitle: `I Found a ${angle.title} for ${cleanPlatform}: "${shortTopic}"`,

    thumbnailHeadline: angle.thumbnailHeadline,
    thumbnailMainText: thumbnailTopic,
    thumbnailSubText: `${cleanGrowth} growth • ${cleanCompetition} competition`,
    thumbnailBadge: angle.badgeColorText,

    posterTitle: angle.posterTitle,
    posterSubtitle: `${shortTopic} is showing ${cleanGrowth} growth with ${lowerCompetition} competition for ${cleanAudience.toLowerCase()} on ${cleanPlatform}.`,
    posterMainText: shortTopic,
    posterBadge: `${cleanGrowth} Growth • ${cleanCompetition} Competition`,

    hook: `${angle.hookPrefix}: "${cleanTopic}". It is showing ${cleanGrowth} growth with ${lowerCompetition} competition, which makes it a strong opportunity for ${cleanAudience.toLowerCase()}.`,

    introScript: `In this video, I am going to break down "${cleanTopic}" and explain why it is becoming a strong ${cleanPlatform} content opportunity. This topic is showing ${cleanGrowth} growth with ${lowerCompetition} competition. The key insight is: ${cleanInsight}`,

    talkingPoints: [
      `Trend signal: "${cleanTopic}" is showing ${cleanGrowth} growth right now.`,
      `Competition level is ${cleanCompetition}, so the content angle needs to be clear and specific.`,
      `Audience fit: this topic can work well for ${cleanAudience.toLowerCase()}.`,
      `Main insight: ${cleanInsight}`,
      `Best execution: use a strong hook, simple explanation, and a practical example for ${cleanPlatform}.`,
    ],

    cta: `If you want more ${cleanNiche} ideas like this, save this video and follow for more ${cleanPlatform} growth strategies.`,

    description: `In this video, we explore "${cleanTopic}" and why it is becoming a strong content opportunity for ${cleanAudience.toLowerCase()} on ${cleanPlatform}.\n\nThis topic is showing ${cleanGrowth} growth with ${lowerCompetition} competition.\n\nKey insight: ${cleanInsight}`,

    tags: [
      cleanTopic,
      cleanNiche,
      cleanPlatform,
      cleanAudience,
      `${cleanPlatform} growth`,
      `${cleanNiche} ideas`,
      "viral video ideas",
      "content strategy",
      "creator tips",
      "trend analysis",
    ],

    hashtags: [
      ...hashtagWords.map((word) => `#${word}`),
      "#YouTubeGrowth",
      "#ContentCreator",
      "#ViralIdeas",
      "#ContentStrategy",
    ],

    pinnedComment: `Would you create a video on "${cleanTopic}"? Comment your angle below.`,
    generatedAt: new Date().toISOString(),
    source: "backend-dynamic",
  };
}

async function createContentPackResult(payload) {
  const topic = cleanString(payload?.topic);

  if (!topic) {
    throw new Error("Topic is required to create a content pack");
  }

  return buildContentPack(payload || {});
}

function buildThumbnailGenerationPrompt({ pack, prompt, variant = 1 }) {
  const topic = cleanString(pack?.topic, "Viral YouTube Topic");
  const extraPrompt = cleanString(prompt, "");

  const styles = [
    "cinematic blue and violet tech creator look with dramatic glow",
    "premium YouTube growth dashboard look with analytics and arrows",
    "clean high-contrast creator studio look with neon accents",
    "modern AI research look with abstract data waves and creator strategy mood",
  ];

  const visualStyle = styles[(Number(variant || 1) - 1) % styles.length];

  return [
    `Generate a professional 16:9 YouTube banner/thumbnail background image for this topic: ${topic}.`,
    `Style: ${visualStyle}.`,
    "Important: Do not add any text, words, letters, numbers, captions, subtitles, labels, logo, watermark, signature, UI text, fake text, or readable typography inside the image.",
    "Create only a clean visual background with strong composition, premium lighting, modern creator-economy design, abstract visuals, charts without numbers, glow effects, and enough empty space.",
    "The image should work as a banner background where text can be added later by the frontend/editor.",
    extraPrompt ? `User extra direction: ${extraPrompt}. Do not include text in the image.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateThumbnailResult({ pack, prompt, variant }) {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not configured on the backend");
  }

  const finalPrompt = buildThumbnailGenerationPrompt({
    pack,
    prompt,
    variant,
  });

  const model =
    process.env.HF_IMAGE_MODEL || "ideogram-ai/ideogram-4-fp8";

  const response = await fetch(
    `${process.env.HF_BASE_URL || "https://router.huggingface.co/hf-inference/models"}/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: finalPrompt,
        parameters: {
          width: 1536,
          height: 864,
        },
      }),
    }
  );

  const contentType = response.headers.get("content-type") || "";
  const buffer = await response.arrayBuffer();

  if (!response.ok) {
    const errorText = Buffer.from(buffer).toString("utf8");

    let errorMessage = "Failed to generate AI thumbnail";

    try {
      const parsedError = JSON.parse(errorText);
      errorMessage =
        parsedError.error ||
        parsedError.message ||
        errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (contentType.includes("application/json")) {
    const jsonText = Buffer.from(buffer).toString("utf8");
    const data = JSON.parse(jsonText);

    if (data.error) {
      throw new Error(data.error);
    }

    throw new Error("Hugging Face did not return image data");
  }

  const imageBase64 = Buffer.from(buffer).toString("base64");

  return {
    imageBase64,
    imageUrl: `data:image/png;base64,${imageBase64}`,
    prompt: finalPrompt,
    model,
    size: "1536x864",
    outputFormat: "png",
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createResearchResult,
  analyzeCompetitorChannelResult,
  createContentPackResult,
  generateThumbnailResult,
};