import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Hash,
  Image,
  Loader2,
  MessageCircle,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { generateAiThumbnail } from "../lib/api";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      className="h-8 shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function SectionCard({ icon: Icon, title, children, copyText }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10">
              <Icon className="h-5 w-5 text-cyan-300" />
            </div>

            <h2 className="text-base font-semibold text-white">{title}</h2>
          </div>

          {copyText && <CopyButton text={copyText} />}
        </div>

        <div className="text-sm leading-7 text-zinc-300">{children}</div>
      </CardContent>
    </Card>
  );
}

function createSlugWords(text) {
  return String(text || "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 5);
}

function limitText(text, length) {
  const value = String(text || "");

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trim()}...`;
}

function getCompetitionAngle(competition) {
  const value = String(competition || "").toLowerCase();

  if (value === "low") {
    return {
      title: "Low Competition Opportunity",
      thumbnailHeadline: "LOW COMPETITION",
      posterTitle: "Create This Before Everyone Finds It",
      hookPrefix: "Most creators are still ignoring this topic",
      badgeColorText: "Low Competition",
    };
  }

  if (value === "high") {
    return {
      title: "High Demand Topic",
      thumbnailHeadline: "TRENDING NOW",
      posterTitle: "This Topic Is Already Exploding",
      hookPrefix: "This topic is already getting attention",
      badgeColorText: "High Demand",
    };
  }

  return {
    title: "Fast Growing Topic",
    thumbnailHeadline: "VIRAL IDEA",
    posterTitle: "This Idea Can Grow Fast",
    hookPrefix: "This topic is gaining momentum",
    badgeColorText: "Growing Fast",
  };
}

function buildDynamicPack(rawPack) {
  const topic = rawPack?.topic || "Viral YouTube Topic";
  const growth = rawPack?.growth || "+72%";
  const competition = rawPack?.competition || "Medium";
  const insight =
    rawPack?.insight ||
    "This topic has strong creator demand and can perform well with the right content angle.";

  const niche = rawPack?.niche || "content creators";
  const platform = rawPack?.platform || "YouTube";
  const audience = rawPack?.audience || "New creators";

  const angle = getCompetitionAngle(competition);
  const shortTopic = limitText(topic, 46);
  const thumbnailTopic = limitText(topic, 36);
  const hashtagWords = createSlugWords(topic);

  const videoTitle =
    rawPack?.videoTitle ||
    `I Found a ${angle.title} for ${platform}: "${shortTopic}"`;

  const hook =
    rawPack?.hook ||
    `${angle.hookPrefix}: "${topic}". It is showing ${growth} growth with ${String(
      competition
    ).toLowerCase()} competition, which makes it a strong opportunity for ${audience.toLowerCase()}.`;

  const introScript =
    rawPack?.introScript ||
    `In this video, I am going to break down "${topic}" and explain why it is becoming a strong ${platform} content opportunity. This topic is showing ${growth} growth with ${String(
      competition
    ).toLowerCase()} competition. The key insight is: ${insight} I will also show how ${audience.toLowerCase()} can use this topic, what angle to take, and how to make the first few seconds more engaging.`;

  const talkingPoints =
    rawPack?.talkingPoints?.length > 0
      ? rawPack.talkingPoints
      : [
        `Trend signal: "${topic}" is showing ${growth} growth right now.`,
        `Competition level is ${competition}, so the content angle needs to be clear and specific.`,
        `Audience fit: this topic can work well for ${audience.toLowerCase()}.`,
        `Main insight: ${insight}`,
        `Best execution: use a strong hook, simple explanation, and a practical example for ${platform}.`,
      ];

  const cta =
    rawPack?.cta ||
    `If you want more ${niche} ideas like this, save this video and follow for more ${platform} growth strategies.`;

  const description =
    rawPack?.description ||
    `In this video, we explore "${topic}" and why it is becoming a strong content opportunity for ${audience.toLowerCase()} on ${platform}.\n\nThis topic is showing ${growth} growth with ${String(
      competition
    ).toLowerCase()} competition.\n\nKey insight: ${insight}\n\nYou will learn the best content angle, hook, talking points, and execution strategy to create a better video around this topic.`;

  const tags =
    rawPack?.tags?.length > 0
      ? rawPack.tags
      : [
        topic,
        niche,
        platform,
        audience,
        `${platform} growth`,
        `${niche} ideas`,
        "viral video ideas",
        "content strategy",
        "creator tips",
        "trend analysis",
      ];

  const hashtags =
    rawPack?.hashtags?.length > 0
      ? rawPack.hashtags
      : [
        ...hashtagWords.map((word) => `#${word}`),
        "#YouTubeGrowth",
        "#ContentCreator",
        "#ViralIdeas",
        "#ContentStrategy",
      ];

  const pinnedComment =
    rawPack?.pinnedComment ||
    `Would you create a video on "${topic}"? Comment your angle below.`;

  return {
    ...rawPack,

    topic,
    growth,
    competition,
    insight,
    niche,
    platform,
    audience,

    videoTitle,

    thumbnailHeadline: rawPack?.thumbnailHeadline || angle.thumbnailHeadline,
    thumbnailMainText: rawPack?.thumbnailMainText || thumbnailTopic,
    thumbnailSubText:
      rawPack?.thumbnailSubText ||
      `${growth} growth • ${competition} competition`,
    thumbnailBadge: rawPack?.thumbnailBadge || angle.badgeColorText,

    posterTitle: rawPack?.posterTitle || angle.posterTitle,
    posterSubtitle:
      rawPack?.posterSubtitle ||
      `${shortTopic} is showing ${growth} growth with ${String(
        competition
      ).toLowerCase()} competition for ${audience.toLowerCase()} on ${platform}.`,
    posterMainText: rawPack?.posterMainText || shortTopic,
    posterBadge:
      rawPack?.posterBadge || `${growth} Growth • ${competition} Competition`,

    hook,
    introScript,
    talkingPoints,
    cta,
    description,
    tags,
    hashtags,
    pinnedComment,
  };
}

function ThumbnailPreview({ pack, imageUrl, loading = false }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111827] via-[#172554] to-[#581c87] shadow-2xl shadow-cyan-950/40">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={pack?.topic || "AI thumbnail"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.35),transparent_35%)]" />
      )}

      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-md">
            <Sparkles className="h-12 w-12 text-cyan-200" />
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 text-center backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
          <p className="text-sm font-semibold text-white">
            Generating AI banner image...
          </p>
        </div>
      )}
    </div>
  );
}
function PosterPreview({ pack }) {
  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#020617] via-[#111827] to-[#312e81] p-6 shadow-2xl shadow-violet-950/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_40%)]" />

      <div className="relative z-10 flex min-h-[510px] flex-col justify-between">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
            {pack.posterBadge}
          </div>

          <h3 className="text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">
            {pack.posterTitle}
          </h3>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
              Topic
            </p>

            <p className="mt-2 text-2xl font-black uppercase leading-tight text-white">
              {pack.posterMainText}
            </p>
          </div>

          <p className="mt-5 text-base leading-7 text-zinc-300">
            {pack.posterSubtitle}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Hook
          </p>

          <p className="mt-2 text-xl font-semibold leading-8 text-white">
            {pack.hook}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">ViralMind</p>
            <p className="text-xs text-zinc-500">AI YouTube Research</p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black">
            Create Now
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentPack() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawPack = location.state?.contentPack;
  const pack = rawPack ? buildDynamicPack(rawPack) : null;
  const autoThumbnailStartedRef = React.useRef(false);

  const [aiThumbnails, setAiThumbnails] = React.useState([]);
  const [thumbnailLoading, setThumbnailLoading] = React.useState(false);
  const [thumbnailError, setThumbnailError] = React.useState("");
  const [thumbnailPrompt, setThumbnailPrompt] = React.useState("");

  const activeThumbnail = aiThumbnails[0] || null;

  const handleGenerateThumbnail = React.useCallback(
    async ({ auto = false } = {}) => {
      if (!pack || thumbnailLoading) {
        return;
      }

      setThumbnailLoading(true);
      setThumbnailError("");

      try {
        const result = await generateAiThumbnail({
          pack,
          prompt: auto ? "" : thumbnailPrompt,
          variant: aiThumbnails.length + 1,
        });

        setAiThumbnails((current) => [result, ...current].slice(0, 6));
      } catch (err) {
        setThumbnailError(err.message || "AI thumbnail generate nahi ho paaya.");
      } finally {
        setThumbnailLoading(false);
      }
    },
    [aiThumbnails.length, pack, thumbnailLoading, thumbnailPrompt]
  );

  React.useEffect(() => {
    if (!pack || autoThumbnailStartedRef.current) {
      return;
    }

    autoThumbnailStartedRef.current = true;
    handleGenerateThumbnail({ auto: true });
  }, [handleGenerateThumbnail, pack]);

  const handleDownloadThumbnail = () => {
    if (!activeThumbnail?.imageUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = activeThumbnail.imageUrl;
    link.download = `${String(pack.topic || "ai-thumbnail")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-thumbnail.${activeThumbnail.outputFormat || "jpeg"}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!pack) {
    return (
      <DashboardLayout eyebrow="Content Pack" title="No content pack found">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-xl border-white/10 bg-white/[0.04]">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10">
                <FileText className="h-7 w-7 text-cyan-300" />
              </div>

              <h1 className="text-2xl font-semibold text-white">
                Content pack not available
              </h1>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Please go back to the dashboard and click Create Now on any
                trending topic.
              </p>

              <Button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-6 rounded-full bg-cyan-300 px-6 text-sm font-semibold text-black hover:bg-cyan-200"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout eyebrow="Content Pack" title="Ready-to-record content">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="h-10 w-fit rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm text-zinc-200 hover:bg-white/[0.1]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-200">
          Generated for: {pack.topic}
        </div>
      </div>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Dynamic Premium Content Pack
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {pack.videoTitle}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              This page is generated from the selected topic data: growth,
              competition, insight, niche, platform and audience.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-zinc-500">Growth</p>
                <p className="mt-1 text-lg font-semibold text-cyan-200">
                  {pack.growth}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-zinc-500">Competition</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {pack.competition}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-zinc-500">Platform</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {pack.platform}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleDownloadThumbnail}
                disabled={!activeThumbnail?.imageUrl}
                className="rounded-full bg-cyan-300 px-5 text-sm font-semibold text-black hover:bg-cyan-200"
              >
                <Download className="h-4 w-4" />
                Download AI Thumbnail
              </Button>

              <CopyButton text={pack.videoTitle} />
            </div>
          </div>

          <ThumbnailPreview
            pack={pack}
            imageUrl={activeThumbnail?.imageUrl}
            loading={thumbnailLoading && !activeThumbnail}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <SectionCard
            icon={PlayCircle}
            title="Video Title"
            copyText={pack.videoTitle}
          >
            <p className="text-lg font-semibold text-white">
              {pack.videoTitle}
            </p>
          </SectionCard>

          <SectionCard icon={Image} title="AI Thumbnail Picture">
            <div className="space-y-4">
              <ThumbnailPreview
                pack={pack}
                imageUrl={activeThumbnail?.imageUrl}
                loading={thumbnailLoading}
              />

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Optional custom thumbnail direction
                </label>

                <textarea
                  value={thumbnailPrompt}
                  onChange={(event) => setThumbnailPrompt(event.target.value)}
                  placeholder="Example: neon blue dashboard background, shocked creator face, abstract analytics, no text, clean empty space..."
                  className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/40"
                />

                {thumbnailError && (
                  <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs leading-6 text-red-200">
                    {thumbnailError}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => handleGenerateThumbnail()}
                    disabled={thumbnailLoading}
                    className="h-11 rounded-full bg-cyan-300 px-5 text-sm font-semibold text-black hover:bg-cyan-200 sm:w-fit"
                  >
                    {thumbnailLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    {thumbnailLoading ? "Creating..." : "Create AI Thumbnail"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleDownloadThumbnail}
                    disabled={!activeThumbnail?.imageUrl}
                    className="h-11 rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-zinc-200 hover:bg-white/[0.1] sm:w-fit"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {aiThumbnails.length > 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiThumbnails.map((thumbnail, index) => (
                    <button
                      key={`${thumbnail.generatedAt}-${index}`}
                      type="button"
                      onClick={() =>
                        setAiThumbnails((current) => [
                          thumbnail,
                          ...current.filter((item) => item !== thumbnail),
                        ])
                      }
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-left transition hover:border-cyan-300/30"
                    >
                      <img
                        src={thumbnail.imageUrl}
                        alt={`AI thumbnail variant ${index + 1}`}
                        className="aspect-video w-full rounded-xl object-cover"
                      />

                      <p className="mt-2 px-1 text-xs text-zinc-500">
                        Variant {index + 1}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={TrendingUp} title="Dynamic Insight">
            <p>{pack.insight}</p>
          </SectionCard>

          <SectionCard icon={FileText} title="Hook" copyText={pack.hook}>
            <p>{pack.hook}</p>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Intro Script"
            copyText={pack.introScript}
          >
            <p>{pack.introScript}</p>
          </SectionCard>

          <SectionCard
            icon={CheckCircle2}
            title="5 Talking Points"
            copyText={pack.talkingPoints.join("\n")}
          >
            <div className="space-y-3">
              {pack.talkingPoints.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                    {index + 1}
                  </div>

                  <p>{point}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={MessageCircle} title="CTA" copyText={pack.cta}>
            <p>{pack.cta}</p>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Description"
            copyText={pack.description}
          >
            <p className="whitespace-pre-line">{pack.description}</p>
          </SectionCard>

          <SectionCard icon={Hash} title="Tags" copyText={pack.tags.join(", ")}>
            <div className="flex flex-wrap gap-2">
              {pack.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Hash}
            title="Hashtags"
            copyText={pack.hashtags.join(" ")}
          >
            <div className="flex flex-wrap gap-2">
              {pack.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={MessageCircle}
            title="Pinned Comment"
            copyText={pack.pinnedComment}
          >
            <p>{pack.pinnedComment}</p>
          </SectionCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <SectionCard icon={Image} title="Poster Picture">
            <PosterPreview pack={pack} />
          </SectionCard>

          <Card className="border-cyan-300/15 bg-cyan-300/[0.04]">
            <CardContent className="p-5">
              <h3 className="text-base font-semibold text-cyan-100">
                Creator Tip
              </h3>

              <p className="mt-2 text-sm leading-7 text-cyan-100/80">
                Use the hook in the first 3 seconds, thumbnail as the main
                visual, and pinned comment to improve engagement.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}