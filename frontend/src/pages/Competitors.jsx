import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  BarChart3,
  ExternalLink,
  Loader2,
  Search,
  Users,
} from "lucide-react";

import { analyzeCompetitorChannel } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const defaultCompetitors = [
  {
    channel: "CreatorLab AI",
    niche: "AI Tools",
    subscribers: "482K",
    avgViews: "428K",
    growth: "+38%",
    uploadRate: "4/week",
    opportunityScore: "92",
  },
  {
    channel: "TubeSprint",
    niche: "YouTube Growth",
    subscribers: "291K",
    avgViews: "311K",
    growth: "+24%",
    uploadRate: "3/week",
    opportunityScore: "86",
  },
  {
    channel: "Prompt Studio",
    niche: "Productivity",
    subscribers: "184K",
    avgViews: "247K",
    growth: "+19%",
    uploadRate: "2/week",
    opportunityScore: "81",
  },
];

function isValidYouTubeUrl(value) {
  const cleanValue = value.trim();

  return (
    cleanValue.includes("youtube.com/") ||
    cleanValue.includes("youtu.be/") ||
    cleanValue.startsWith("@")
  );
}

export default function Competitors() {
  const [channelUrl, setChannelUrl] = useState("");
  const [competitors, setCompetitors] = useState(defaultCompetitors);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyzeChannel = async () => {
    if (!channelUrl.trim()) {
      setError("Please paste a YouTube channel URL first.");
      return;
    }

    if (!isValidYouTubeUrl(channelUrl)) {
      setError("Please enter a valid YouTube channel URL or @handle.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await analyzeCompetitorChannel({
        channelUrl: channelUrl.trim(),
      });

      const analyzedCompetitor = {
        channel: data.channel || "Unknown Channel",
        niche: "YouTube Channel",
        subscribers: data.subscribers || "Not available",
        avgViews: data.avgViews || "0",
        growth: data.growth || "+0%",
        uploadRate: data.uploadRate || "Not available",
        opportunityScore: data.opportunityScore || "0",
        channelUrl: data.channelUrl || channelUrl,
        summary: data.summary || "",
        topVideos: Array.isArray(data.topVideos) ? data.topVideos : [],
      };

      setSelectedAnalysis(analyzedCompetitor);
      setCompetitors([analyzedCompetitor]);
    } catch (err) {
      setError(err.message || "Failed to analyze channel.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout
      eyebrow="Competitors"
      title="Analyze competitor channels"
    >
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
          Competitor Analysis
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Paste a YouTube channel URL and analyze its average views, recent
          uploads, top videos, and opportunity score.
        </p>
      </section>

      <Card className="mb-6 border-white/10 bg-white/[0.04]">
        <CardContent className="grid gap-3 p-3 sm:grid-cols-[1fr_auto]">
          <label className="flex h-14 min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
            <Search className="h-5 w-5 shrink-0 text-zinc-500" />

            <input
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAnalyzeChannel();
                }
              }}
              placeholder="Paste YouTube channel URL, e.g. https://youtube.com/@channel"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>

          <Button
            type="button"
            onClick={handleAnalyzeChannel}
            disabled={loading}
            className="h-14 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Channel"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            Analyzing competitor channel...
          </div>
        </div>
      )}

      {!loading && selectedAnalysis && (
        <section className="mb-6 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                Channel Summary
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedAnalysis.channel}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                {selectedAnalysis.summary}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => handleOpenUrl(selectedAnalysis.channelUrl)}
              className="h-10 rounded-full border border-white/10 bg-white/[0.05] px-4 text-xs text-zinc-200 hover:bg-white/[0.1]"
            >
              <ExternalLink className="h-4 w-4" />
              Open Channel
            </Button>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {competitors.map((item, index) => (
          <Card
            key={`${item.channel}-${index}`}
            className="border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-cyan-950/20"
          >
            <CardContent className="flex h-full flex-col p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10">
                  <Users className="h-5 w-5 text-violet-300" />
                </div>

                <Button
                  type="button"
                  onClick={() => handleOpenUrl(item.channelUrl)}
                  className="h-9 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>

              <h3 className="text-lg font-semibold text-white">
                {item.channel}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">{item.niche}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Subscribers" value={item.subscribers} />
                <Metric label="Avg Views" value={item.avgViews} />
                <Metric label="Growth" value={item.growth} />
                <Metric label="Uploads" value={item.uploadRate} />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">Opportunity Score</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {item.opportunityScore || "0"}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{
                      width: `${Number(item.opportunityScore) || 0}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-full bg-gradient-to-r from-cyan-300/15 to-violet-400/15 text-sm font-semibold text-cyan-100 ring-1 ring-white/10 hover:from-cyan-300/25 hover:to-violet-400/25"
              >
                <BarChart3 className="h-4 w-4" />
                View Insights
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {selectedAnalysis?.topVideos?.length > 0 && (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Top Videos From This Channel
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Recent high-performing videos found from the pasted channel URL.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedAnalysis.topVideos.map((video, index) => (
              <Card
                key={`${video.title}-${index}`}
                className="overflow-hidden border-white/10 bg-white/[0.04]"
              >
                {video.thumbnail && (
                  <div className="aspect-video w-full overflow-hidden bg-black/30">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-white">
                    {video.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      {video.views} views
                    </span>

                    <Button
                      type="button"
                      onClick={() => handleOpenUrl(video.url)}
                      className="h-8 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}