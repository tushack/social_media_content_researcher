import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Bookmark,
  Copy,
  Flame,
  Loader2,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";

import { createContentPack, getDailyNicheIdeas, saveIdea } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

function getTextValue(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => getTextValue(item, ""))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return value.topic || value.title || value.name || value.text || fallback;
  }

  return fallback;
}

function getGrowthNumber(value) {
  const match = getTextValue(value, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export default function Trends() {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState(location.state?.query || "");
  const [platform, setPlatform] = useState(location.state?.platform || "YouTube");
  const [audience, setAudience] = useState(
    location.state?.audience || "New creators"
  );
  const [trends, setTrends] = useState(
    Array.isArray(location.state?.trends) ? location.state.trends : []
  );

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [savingText, setSavingText] = useState("");
  const [contentPackLoading, setContentPackLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dashboardQuery = location.state?.query || "";
    const dashboardTrends = Array.isArray(location.state?.trends)
      ? location.state.trends
      : [];

    if (dashboardQuery) setQuery(dashboardQuery);
    if (location.state?.platform) setPlatform(location.state.platform);
    if (location.state?.audience) setAudience(location.state.audience);
    if (dashboardTrends.length) setTrends(dashboardTrends);
  }, [location.state]);

  const filteredTrends = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const result = trends.filter((item) => {
      if (!normalizedSearch) return true;

      const title = getTextValue(item.topic || item.title, "").toLowerCase();
      const insight = getTextValue(item.insight, "").toLowerCase();
      const difficulty = getTextValue(item.difficulty, "").toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        insight.includes(normalizedSearch) ||
        difficulty.includes(normalizedSearch)
      );
    });

    if (sortBy === "growth") {
      return [...result].sort(
        (first, second) =>
          getGrowthNumber(second.growth) - getGrowthNumber(first.growth)
      );
    }

    if (sortBy === "lowCompetition") {
      const order = { Low: 1, Medium: 2, High: 3 };

      return [...result].sort(
        (first, second) =>
          (order[getTextValue(first.competition, "Medium")] || 2) -
          (order[getTextValue(second.competition, "Medium")] || 2)
      );
    }

    return result;
  }, [searchText, sortBy, trends]);

  const handleFindTrends = async () => {
    if (!query.trim()) {
      setError("Please enter a niche or keyword first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getDailyNicheIdeas({
        niche: query,
        platform,
        audience,
        limit: 24,
        forceRefresh: true,
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
    const trendTitle = getTextValue(item.topic || item.title, "");

    if (!trendTitle) return;

    try {
      setSavingText(trendTitle);

      await saveIdea({
        type: "Trend",
        content: trendTitle,
        platform,
        niche: query || "Creator Ideas",
      });

      alert("Trend saved successfully");
    } catch (err) {
      alert(err.message || "Failed to save trend");
    } finally {
      setSavingText("");
    }
  };

  const handleShareTrend = async (item) => {
    const title = getTextValue(item.topic || item.title, "Untitled Trend");

    const text =
      item.shareText ||
      `Video Idea: ${title}\nNiche: ${query}\nGrowth: ${getTextValue(
        item.growth,
        "+0%"
      )}\nDifficulty: ${getTextValue(item.difficulty, "Medium Effort")}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }

      await copyToClipboard(text);
      alert("Topic copied for sharing");
    } catch {
      // User cancelled native share.
    }
  };

  const handleCreatePack = async (item) => {
    const title = getTextValue(item.topic || item.title, "Untitled Trend");

    try {
      setContentPackLoading(title);

      const pack = await createContentPack({
        topic: title,
        growth: getTextValue(item.growth, "+0%"),
        competition: getTextValue(item.competition, "Medium"),
        insight: getTextValue(item.insight, "Fresh topic idea."),
        niche: query || "Creator Ideas",
        platform,
        audience,
      });

      navigate("/content-pack", {
        state: {
          contentPack: pack,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to create content pack.");
    } finally {
      setContentPackLoading("");
    }
  };

  return (
    <DashboardLayout eyebrow="Trends" title="All fresh niche topics">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {query ? `${query} Topic Ideas` : "Trending Topics"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Search your niche, refresh fresh topics, save ideas, share them, or
            turn any topic into a full creator pack.
          </p>
        </div>
      </section>

      <Card className="mb-6 border-white/10 bg-white/[0.04]">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleFindTrends();
              }}
              placeholder="Search niche, e.g. Fitness"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-12 rounded-2xl border border-white/10 bg-[#080a12] px-4 text-sm text-white outline-none"
          >
            <option value="newest">Newest</option>
            <option value="growth">High Growth</option>
            <option value="lowCompetition">Low Competition</option>
          </select>

          <Button
            type="button"
            onClick={handleFindTrends}
            disabled={loading}
            className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh Topics"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-11 max-w-md items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Filter topics..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </label>

        <p className="text-sm text-zinc-500">
          {filteredTrends.length} topic{filteredTrends.length === 1 ? "" : "s"} found
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {!loading && !filteredTrends.length && (
        <Card className="border-white/10 bg-white/[0.04]">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <Flame className="h-6 w-6 text-orange-300" />
            </div>

            <h3 className="text-lg font-semibold text-white">No topics yet</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Enter your niche and click Refresh Topics to generate fresh video
              ideas.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTrends.map((item, index) => {
          const title = getTextValue(item.topic || item.title, "Untitled Trend");
          const growth = getTextValue(item.growth, "+0%");
          const competition = getTextValue(item.competition, "Medium");
          const difficulty = getTextValue(item.difficulty, "Medium Effort");
          const insight = getTextValue(
            item.insight,
            "Fresh topic idea for your niche."
          );

          return (
            <Card
              key={`${title}-${index}`}
              className="group border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-cyan-950/30"
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    Growth {growth}
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    {competition}
                  </span>

                  <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs text-violet-200">
                    {difficulty}
                  </span>
                </div>

                <h3 className="text-base font-semibold leading-7 text-white sm:text-lg">
                  {title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-500">
                  {insight}
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => handleCreatePack(item)}
                    disabled={contentPackLoading === title}
                    className="h-10 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20"
                  >
                    {contentPackLoading === title ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Create Pack
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSaveTrend(item)}
                    disabled={savingText === title}
                    className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
                  >
                    <Bookmark className="h-4 w-4" />
                    {savingText === title ? "Saving" : "Save"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleShareTrend(item)}
                    className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      copyToClipboard(title).then(() => alert("Topic copied"))
                    }
                    className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
