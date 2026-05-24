import React, { useEffect, useState } from "react";
import { ArrowRight, Clock, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { getResearchHistory } from "../lib/api";

const CURRENT_RESEARCH_KEY = "viralMindCurrentResearch";

function formatDate(dateValue) {
  if (!dateValue) return "Unknown date";

  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getResearchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenHistory = (item) => {
    const scan = {
      niche: item.niche,
      platform: item.platform,
      audience: item.audience,
      data: item.response_json,
      createdAt: item.created_at,
    };

    localStorage.setItem(CURRENT_RESEARCH_KEY, JSON.stringify(scan));

    navigate("/dashboard", {
      state: {
        historyScan: scan,
      },
    });
  };

  const filteredHistory = history.filter((item) => {
    const searchText = `${item.niche || ""} ${item.platform || ""} ${
      item.audience || ""
    }`.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  return (
    <DashboardLayout eyebrow="History" title="Your research history">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
          Research History
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          View your previous dashboard searches. Click any history row to open
          the dashboard with the same generated topics, hooks, titles, and
          competitor data.
        </p>
      </section>

      <Card className="mb-6 border-white/10 bg-white/[0.04]">
        <CardContent className="flex h-14 items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-zinc-500" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            Loading history...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredHistory.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h3 className="text-lg font-semibold text-white">
            No history found
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Search from the dashboard first, then your research history will
            appear here.
          </p>
        </div>
      )}

      {!loading && !error && filteredHistory.length > 0 && (
        <section className="space-y-3">
          {filteredHistory.map((item) => {
            const topicsCount =
              item.response_json?.trendingTopics?.length || 0;
            const hooksCount = item.response_json?.viralHooks?.length || 0;
            const titlesCount =
              item.response_json?.titleSuggestions?.length || 0;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleOpenHistory(item)}
                className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10">
                      <Clock className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">
                        {item.niche}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.platform} • {item.audience} •{" "}
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 text-xs sm:grid-cols-3 lg:w-[360px]">
                    <MiniStat label="Topics" value={topicsCount} />
                    <MiniStat label="Hooks" value={hooksCount} />
                    <MiniStat label="Titles" value={titlesCount} />
                  </div>

                  <Button
                    type="button"
                    className="h-10 rounded-full bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </button>
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}