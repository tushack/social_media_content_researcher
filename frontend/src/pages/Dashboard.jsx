import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Check,
  ChevronDown,
  Clipboard,
  Compass,
  Copy,
  Flame,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createContentPack, generateResearch, saveIdea } from "../lib/api";
const CURRENT_RESEARCH_KEY = "viralMindCurrentResearch";

const defaultTrendingTopics = [
  {
    topic: "AI agents for everyday productivity",
    growth: "+184%",
    competition: "Medium",
    insight: "Rising search demand with room for creator-led tutorials.",
  },
  {
    topic: "Faceless YouTube automation workflows",
    growth: "+132%",
    competition: "High",
    insight: "Strong monetization intent, but hooks need sharper angles.",
  },
  {
    topic: "Budget creator setup using AI tools",
    growth: "+91%",
    competition: "Low",
    insight: "Beginner-friendly angle with high save/share potential.",
  },
];

const defaultViralHooks = [
  "I tested 7 AI tools so you don't waste your money.",
  "This one YouTube strategy changed my channel in 30 days.",
  "Nobody tells beginners this about going viral on YouTube.",
  "I copied top creators for a week. Here's what actually worked.",
];

const defaultTitleSuggestions = [
  "I Used AI to Find Viral YouTube Ideas for 24 Hours",
  "The Fastest Way to Research Viral YouTube Topics in 2026",
  "Steal My AI Workflow for Finding High-View Video Ideas",
  "How Small Creators Can Beat Big Channels with Better Research",
];

const defaultCompetitors = [
  {
    channel: "CreatorLab AI",
    niche: "AI Tools",
    views: "428K",
    growth: "+38%",
    score: "92",
  },
  {
    channel: "TubeSprint",
    niche: "YouTube Growth",
    views: "311K",
    growth: "+24%",
    score: "86",
  },
  {
    channel: "Prompt Studio",
    niche: "Productivity",
    views: "247K",
    growth: "+19%",
    score: "81",
  },
  {
    channel: "FutureCreator",
    niche: "Creator Tech",
    views: "196K",
    growth: "+14%",
    score: "74",
  },
];


function getTextValue(value, fallback = "Unknown") {
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
      value.text ||
      fallback
    );
  }

  return fallback;
}

function StatCard({ icon: Icon, label, value, caption }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] sm:mb-5">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>

        <p className="text-xs text-zinc-400 sm:text-sm">{label}</p>

        <h3 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {value}
        </h3>

        <p className="mt-2 text-xs leading-5 text-zinc-500">{caption}</p>
      </CardContent>
    </Card>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
      onClick={handleCopy}
      type="button"
      className="h-8 shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function PrettySelect({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={dropdownRef}
      className={`relative h-14 min-w-0 ${open ? "z-[9999]" : "z-10"}`}
    >      <button
      type="button"
      onClick={() => setOpen((current) => !current)}
      className={`flex h-14 w-full min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 text-left text-sm outline-none transition ${open
        ? "border-cyan-300/40 bg-cyan-300/[0.08] shadow-lg shadow-cyan-950/30"
        : "border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]"
        }`}
    >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>

          <p className="mt-0.5 truncate font-medium text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 transition ${open ? "rotate-180 text-cyan-200" : "text-zinc-400"
            }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[9999] overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#050711]/95 p-1 shadow-2xl shadow-black/80 backdrop-blur-2xl">          {options.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm transition ${isSelected
                ? "bg-cyan-300/15 text-cyan-100"
                : "text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                }`}
            >
              <span className="truncate">{option}</span>

              {isSelected && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-black">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
}

function createSlugWords(text) {
  return String(text || "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 4);
}


export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [contentPackLoading, setContentPackLoading] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("YouTube");
  const [selectedAudience, setSelectedAudience] = useState("New creators");

  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState("");
  const [savingText, setSavingText] = useState("");

  useEffect(() => {
    const historyScan = location.state?.historyScan;

    if (historyScan) {
      setNiche(historyScan.niche || "");
      setSelectedPlatform(historyScan.platform || "YouTube");
      setSelectedAudience(historyScan.audience || "New creators");
      setApiData(historyScan.data || null);

      localStorage.setItem(
        CURRENT_RESEARCH_KEY,
        JSON.stringify({
          niche: historyScan.niche || "",
          platform: historyScan.platform || "YouTube",
          audience: historyScan.audience || "New creators",
          data: historyScan.data || null,
          createdAt: historyScan.createdAt || new Date().toISOString(),
        })
      );

      return;
    }

    const savedScan = localStorage.getItem(CURRENT_RESEARCH_KEY);

    if (savedScan) {
      try {
        const parsedScan = JSON.parse(savedScan);

        setNiche(parsedScan.niche || "");
        setSelectedPlatform(parsedScan.platform || "YouTube");
        setSelectedAudience(parsedScan.audience || "New creators");
        setApiData(parsedScan.data || null);
      } catch {
        localStorage.removeItem(CURRENT_RESEARCH_KEY);
      }
    }
  }, [location.state]);

  const topicsToShow = apiData?.trendingTopics || defaultTrendingTopics;
  const hooksToShow = apiData?.viralHooks || defaultViralHooks;
  const titlesToShow = apiData?.titleSuggestions || defaultTitleSuggestions;
  const competitorsToShow = apiData?.competitors || defaultCompetitors;

  const handleFindIdeas = async () => {
    if (!requireAuth()) {
      return;
    }

    if (!niche.trim()) {
      setError("Please enter a niche first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await generateResearch({
        niche,
        platform: selectedPlatform,
        audience: selectedAudience,
      });

      setApiData(data);

      localStorage.setItem(
        CURRENT_RESEARCH_KEY,
        JSON.stringify({
          niche,
          platform: selectedPlatform,
          audience: selectedAudience,
          data,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    if (!requireAuth()) {
      return;
    }
    localStorage.removeItem(CURRENT_RESEARCH_KEY);

    setNiche("");
    setSelectedPlatform("YouTube");
    setSelectedAudience("New creators");
    setApiData(null);
    setError("");
    setSavingText("");
    setContentPackLoading("");

  };

  const handleSaveIdea = async ({ type, content, platform, niche }) => {
    try {
      setSavingText(content);

      await saveIdea({
        type,
        content,
        platform,
        niche,
      });

      alert("Idea saved successfully");
    } catch (err) {
      alert(err.message || "Failed to save idea");
    } finally {
      setSavingText("");
    }
  };

  const handleGenerateContentPack = async (item) => {
    if (!requireAuth()) {
      return;
    }

    setContentPackLoading(item.topic);
    setError("");

    try {
      const pack = await createContentPack({
        topic: item.topic,
        growth: item.growth,
        competition: item.competition,
        insight: item.insight,
        niche: niche || item.niche || "AI Tools",
        platform: selectedPlatform,
        audience: selectedAudience,
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
    <DashboardLayout
      eyebrow="Research Dashboard"
      title="Discover your next viral video"
      onNewScan={handleNewScan}
    >
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 overflow-visible rounded-[1.5rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[2rem]"      >
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="absolute right-8 top-8 hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 xl:block">
            Live trend engine active
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-zinc-300 sm:px-4 sm:text-sm">
              <Flame className="h-4 w-4 shrink-0 text-orange-300" />
              <span className="truncate">
                AI-powered YouTube idea research
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find viral topics before everyone else does.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:mt-5 sm:text-lg">
              Discover high-growth ideas, proven hooks, title angles, and
              competitor gaps built for creators who need speed and clarity.
            </p>
          </div>

          <div className="relative z-[999] mt-7 grid w-full gap-3 rounded-3xl border border-white/10 bg-black/25 p-3 sm:mt-8 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.4fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_auto]">                      <label className="flex h-14 min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 md:col-span-2 xl:col-span-1">
            <Search className="h-5 w-5 shrink-0 text-zinc-500" />

            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFindIdeas();
                }
              }}
              placeholder="Enter niche, e.g. AI tools"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>

            <PrettySelect
              label="Platform"
              value={selectedPlatform}
              onChange={setSelectedPlatform}
              options={["YouTube", "YouTube Shorts"]}
            />

            <PrettySelect
              label="Audience"
              value={selectedAudience}
              onChange={setSelectedAudience}
              options={["New creators", "Startup founders", "Students", "Marketers"]}
            />

            <Button
              type="button"
              onClick={handleFindIdeas}
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200 md:col-span-2 xl:col-span-1 xl:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding Ideas...
                </>
              ) : (
                "Find Viral Ideas"
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>
      </motion.section>

      <section className="relative z-0 mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Compass}
          label="Ideas Found"
          value={apiData ? topicsToShow.length * 42 : "248"}
          caption="Based on current creator demand"
        />

        <StatCard
          icon={TrendingUp}
          label="Avg Trend Growth"
          value="+127%"
          caption="Across your selected niche"
        />

        <StatCard
          icon={Clipboard}
          label="Hooks Generated"
          value={hooksToShow.length}
          caption="Ready to test in scripts"
        />

        <StatCard
          icon={BarChart3}
          label="Competitors Tracked"
          value={competitorsToShow.length}
          caption="Updated from latest uploads"
        />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Trending Topics
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              High-potential ideas ranked by growth, competition, and audience
              fit.
            </p>
          </div>

          <Button
            type="button"
            className="h-9 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] sm:w-auto"
          >
            View All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topicsToShow.map((item, index) => (
            <motion.div
              key={`${item.topic}-${index}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="min-w-0"
            >
              <Card className="group h-full border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-cyan-950/30">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      Growth {item.growth}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                      {item.competition}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold leading-7 text-white sm:text-lg">
                    {item.topic}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-zinc-500">
                    {item.insight}
                  </p>

                  <Button
                    type="button"
                    onClick={() => handleGenerateContentPack(item)}
                    disabled={contentPackLoading === item.topic}
                    className="mt-6 h-12 w-full !rounded-full border border-cyan-300/20 bg-gradient-to-r from-cyan-300/15 to-violet-400/15 px-5 text-sm font-semibold text-cyan-100 shadow-inner shadow-white/5 hover:from-cyan-300/25 hover:to-violet-400/25"
                    style={{ borderRadius: "9999px" }}
                  >
                    {contentPackLoading === item.topic ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {contentPackLoading === item.topic ? "Creating..." : "Create Now"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      handleSaveIdea({
                        type: "Topic",
                        content: item.topic,
                        platform: selectedPlatform,
                        niche: niche || item.niche || "AI Tools",
                      })
                    }
                    disabled={savingText === item.topic}
                    className="mt-3 h-11 w-full rounded-full border border-white/10 bg-white/[0.04] px-5 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
                  >
                    {savingText === item.topic ? "Saving..." : "Save Topic"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Viral Hooks
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Use these as openings for intros, Shorts, and thumbnails.
            </p>
          </div>

          <div className="space-y-3">
            {hooksToShow.map((hook, index) => (
              <Card
                key={`${hook}-${index}`}
                className="border-white/10 bg-white/[0.04]"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-xs font-semibold text-violet-200">
                      {index + 1}
                    </div>

                    <p className="min-w-0 text-sm leading-6 text-zinc-200">
                      {hook}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <CopyButton text={hook} />

                    <Button
                      type="button"
                      onClick={() =>
                        handleSaveIdea({
                          type: "Hook",
                          content: hook,
                          platform: selectedPlatform,
                          niche: niche || "AI Tools",
                        })
                      }
                      disabled={savingText === hook}
                      className="h-8 shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
                    >
                      {savingText === hook ? "Saving" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              AI Title Suggestions
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Clickable titles optimized for curiosity and search intent.
            </p>
          </div>

          <div className="grid gap-3">
            {titlesToShow.map((title, index) => (
              <Card
                key={`${title}-${index}`}
                className="border-white/10 bg-white/[0.04] transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06]"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="min-w-0 text-left text-sm font-medium leading-6 text-zinc-100 hover:text-cyan-200"
                  >
                    {title}
                  </button>

                  <div className="flex shrink-0 gap-2">
                    <CopyButton text={title} />

                    <Button
                      type="button"
                      onClick={() =>
                        handleSaveIdea({
                          type: "Title",
                          content: title,
                          platform: selectedPlatform,
                          niche: niche || "AI Tools",
                        })
                      }
                      disabled={savingText === title}
                      className="h-8 shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs text-zinc-200 hover:bg-white/[0.1]"
                    >
                      {savingText === title ? "Saving" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Competitor Analysis
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Track top channels, average views, and growth momentum in your
              niche.
            </p>
          </div>

          <Button
            type="button"
            className="h-9 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] sm:w-auto"
          >
            Export Report
          </Button>
        </div>

        <Card className="overflow-hidden border-white/10 bg-white/[0.04]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Top Channel</th>
                    <th className="px-5 py-4 font-medium">Niche</th>
                    <th className="px-5 py-4 font-medium">Average Views</th>
                    <th className="px-5 py-4 font-medium">Growth</th>
                    <th className="px-5 py-4 font-medium">Opportunity</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {competitorsToShow.map((item, index) => {
                    const channelName = getTextValue(
                      item.channel,
                      "Unknown Channel"
                    );

                    return (
                      <tr
                        key={`${channelName}-${index}`}
                        className="transition hover:bg-white/[0.035]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-white">
                              {channelName.slice(0, 2).toUpperCase()}
                            </div>

                            <span className="font-medium text-white">
                              {channelName}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-zinc-400">
                          {getTextValue(item.niche, "AI Tools")}
                        </td>

                        <td className="px-5 py-4 text-zinc-200">
                          {getTextValue(item.views, "0")}
                        </td>

                        <td className="px-5 py-4 text-cyan-300">
                          {getTextValue(item.growth, "+0%")}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cyan-300"
                                style={{
                                  width: `${Number(item.score) || 0}%`,
                                }}
                              />
                            </div>

                            <span className="text-zinc-300">
                              {getTextValue(item.score, "0")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}