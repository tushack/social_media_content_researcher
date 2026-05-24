import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  ArrowUpRight,
  Bookmark,
  Flame,
  Loader2,
  Search,
} from "lucide-react";

import { generateResearch, saveIdea } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Trends() {
  const [query, setQuery] = useState("");
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingText, setSavingText] = useState("");
  const [error, setError] = useState("");

  const handleFindTrends = async () => {
    if (!query.trim()) {
      setError("Please enter a niche or keyword first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await generateResearch({
        niche: query,
        platform: "YouTube",
        audience: "New creators",
      });

      const dynamicTrends = Array.isArray(data?.trendingTopics)
        ? data.trendingTopics
        : [];

      setTrends(dynamicTrends);
    } catch (err) {
      setError(err.message || "Failed to fetch trends.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrend = async (item) => {
    const trendTitle = item.topic || item.title;

    if (!trendTitle) return;

    try {
      setSavingText(trendTitle);

      await saveIdea({
        type: "Trend",
        content: trendTitle,
        platform: "YouTube",
        niche: query || "AI Tools",
      });

      alert("Trend saved successfully");
    } catch (err) {
      alert(err.message || "Failed to save trend");
    } finally {
      setSavingText("");
    }
  };

  return (
    <DashboardLayout eyebrow="Trends" title="Discover trending video topics">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Trending Topics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Search any niche and discover dynamic YouTube trend ideas from your
            backend research engine.
          </p>
        </div>
      </section>

      <Card className="mb-6 border-white/10 bg-white/[0.04]">
        <CardContent className="grid gap-3 p-3 sm:grid-cols-[1fr_auto]">
          <label className="flex h-14 min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
            <Search className="h-5 w-5 shrink-0 text-zinc-500" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFindTrends();
                }
              }}
              placeholder="Search niche, e.g. AI tools, fitness, gaming..."
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>

          <Button
            type="button"
            onClick={handleFindTrends}
            disabled={loading}
            className="h-14 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding Trends...
              </>
            ) : (
              "Find Trends"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && trends.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h3 className="text-lg font-semibold text-white">
            Search to discover trends
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Enter a niche above and click Find Trends to get dynamic topics.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            Fetching YouTube trend data...
          </div>
        </div>
      )}

      {!loading && trends.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trends.map((item, index) => {
            const title = item.topic || item.title || "Untitled Trend";
            const growth = item.growth || "+0%";
            const competition = item.competition || "Medium";
            const insight =
              item.insight ||
              "This topic has potential for YouTube content research.";

            return (
              <Card
                key={`${title}-${index}`}
                className="border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-cyan-950/20"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10">
                      <Flame className="h-5 w-5 text-cyan-300" />
                    </div>

                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      {growth}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold leading-7 text-white">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    {query || "YouTube Research"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-zinc-500">Source</p>
                      <p className="mt-1 font-semibold text-white">Apify</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-zinc-500">Competition</p>
                      <p className="mt-1 font-semibold text-white">
                        {competition}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-zinc-500">
                    {insight}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <Button
                      type="button"
                      className="h-10 flex-1 rounded-full bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200"
                    >
                      Analyze
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSaveTrend(item)}
                      disabled={savingText === title}
                      className="h-10 rounded-full border border-white/10 bg-white/[0.05] px-4 text-zinc-200 hover:bg-white/[0.1]"
                    >
                      {savingText === title ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
}