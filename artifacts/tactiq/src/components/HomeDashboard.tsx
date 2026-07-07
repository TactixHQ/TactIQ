import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Flame,
  TrendingUp,
  ChevronRight,
  Plus,
  Brain,
  Award,
  Sparkles,
  BookOpen,
  Users,
  Play,
  Target,
  Shield,
  Activity,
  Trophy
} from "lucide-react";
import { FootballMatch, Tactic } from "../types";
import { LogoFull } from "./Logo";

interface HomeDashboardProps {
  tactics: Tactic[];
  matches: FootballMatch[];
  streakDays: number;
  tacticalRating: number;
  onSelectTactic: (tacticId: string) => void;
  onNewTactic: (formation?: string) => void;
  onNavigate: (view: string) => void;
  onStartChallenge: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getRatingLevel(rating: number): string {
  if (rating >= 1000) return "Elite Tactician";
  if (rating >= 900) return "Level 5 — Expert";
  if (rating >= 800) return "Level 4 — Analyst";
  if (rating >= 700) return "Level 3 — Coach";
  return "Level 2 — Learner";
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function HomeDashboard({
  tactics,
  matches,
  streakDays,
  tacticalRating,
  onSelectTactic,
  onNewTactic,
  onNavigate,
  onStartChallenge
}: HomeDashboardProps) {
  const [insight, setInsight] = useState<string>("");
  const [drillSuggestion, setDrillSuggestion] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightDismissed, setInsightDismissed] = useState<boolean>(false);

  useEffect(() => {
    const serializedMatches = JSON.stringify(matches);
    const cachedStr = localStorage.getItem("tactiq_insights_cache");
    if (cachedStr) {
      try {
        const cache = JSON.parse(cachedStr);
        if (cache.serializedMatches === serializedMatches && cache.insight) {
          setInsight(cache.insight);
          setDrillSuggestion(cache.drillSuggestion || "");
          return;
        }
      } catch {
        localStorage.removeItem("tactiq_insights_cache");
      }
    }

    async function fetchInsights() {
      setLoadingInsight(true);
      try {
        const res = await fetch("/api/gemini/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matches }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setInsight(data.insight);
        setDrillSuggestion(data.drillSuggestion || "");
        localStorage.setItem("tactiq_insights_cache", JSON.stringify({
          serializedMatches,
          insight: data.insight,
          drillSuggestion: data.drillSuggestion
        }));
      } catch {
        const fallback = matches.length > 0
          ? `Analysis of your last ${matches.length} ${matches.length === 1 ? "match" : "matches"} shows a pattern of transition vulnerabilities behind advancing fullbacks. Reinforce midfield cover during attacking phases.`
          : "Log your first match to unlock personalized AI coaching insights. Your Match Brain will identify recurring patterns and suggest targeted training drills.";
        const fallbackDrill = matches.length > 0 ? "Defensive Transition Recovery" : "Rondo Possession Warm-up";
        setInsight(fallback);
        setDrillSuggestion(fallbackDrill);
        localStorage.setItem("tactiq_insights_cache", JSON.stringify({
          serializedMatches,
          insight: fallback,
          drillSuggestion: fallbackDrill
        }));
      } finally {
        setLoadingInsight(false);
      }
    }
    fetchInsights();
  }, [matches]);

  const nextMatch = matches[0] ?? null;
  const ratingLevel = useMemo(() => getRatingLevel(tacticalRating), [tacticalRating]);

  // Compute stats metrics dynamically
  const matchResult = useMemo(() => {
    if (!nextMatch) return null;
    if (nextMatch.scoreHome > nextMatch.scoreAway) return "WIN";
    if (nextMatch.scoreHome < nextMatch.scoreAway) return "LOSS";
    return "DRAW";
  }, [nextMatch]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-zinc-200 pb-28 md:pb-16 select-none">

      {/* ── Welcome Header Section (Apple & Stripe layout) ── */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-zinc-800/80 pb-6 sm:pb-8">
        <div className="space-y-2">
          <LogoFull className="h-8 md:h-9 opacity-95 transition-opacity hover:opacity-100" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white mt-2">
            {getGreeting()}, Coach.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Welcome back to your tactical hub. Your match analytics are processed, system setups are compiled, and simulated outcomes are primed.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400 font-mono bg-emerald-950/25 border border-emerald-900/30 px-3 py-1 rounded-full mt-2 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <button
            id="btn-quick-new-tactic"
            onClick={() => onNewTactic()}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 border border-emerald-500/30"
            aria-label="Create a new tactic board"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Tactic</span>
          </button>

          <button
            onClick={() => onNavigate("team")}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 bg-zinc-900/90 hover:bg-zinc-800 active:scale-[0.98] text-zinc-200 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border border-zinc-800 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Go to Team Workspace"
          >
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Team</span>
          </button>

          <button
            onClick={() => onNavigate("simulator")}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 bg-zinc-900/90 hover:bg-zinc-800 active:scale-[0.98] text-zinc-200 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border border-zinc-800 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Go to Match Simulator"
          >
            <Play className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulator</span>
          </button>
        </div>
      </header>

      {/* ── Premium High-Contrast Statistics Row ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Dashboard Metrics">
        {/* Total Tactics */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:border-zinc-700/60 transition-all duration-300 group">
          <div className="p-2.5 sm:p-3 bg-zinc-800/40 group-hover:bg-emerald-950/20 group-hover:border-emerald-900/40 rounded-xl border border-zinc-700/50 text-emerald-400 shrink-0 transition-all duration-300">
            <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold truncate">TACTICS BOARD</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white mt-0.5 tracking-tight">{tactics.length}</p>
          </div>
        </div>

        {/* Matches Played */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:border-zinc-700/60 transition-all duration-300 group">
          <div className="p-2.5 sm:p-3 bg-zinc-800/40 group-hover:bg-emerald-950/20 group-hover:border-emerald-900/40 rounded-xl border border-zinc-700/50 text-emerald-400 shrink-0 transition-all duration-300">
            <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold truncate">MATCH TRACKER</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white mt-0.5 tracking-tight">{matches.length}</p>
          </div>
        </div>

        {/* Tactical Rating */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:border-zinc-700/60 transition-all duration-300 group">
          <div className="p-2.5 sm:p-3 bg-zinc-800/40 group-hover:bg-amber-950/20 group-hover:border-amber-900/40 rounded-xl border border-zinc-700/50 text-amber-500 shrink-0 transition-all duration-300">
            <Award className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold truncate">TACTICAL RATING</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white mt-0.5 tracking-tight">{tacticalRating}</p>
              <span className="text-[9px] text-zinc-400 truncate max-w-[80px]" title={ratingLevel}>{ratingLevel}</span>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:border-zinc-700/60 transition-all duration-300 group">
          <div className="p-2.5 sm:p-3 bg-zinc-800/40 group-hover:bg-orange-950/20 group-hover:border-orange-900/40 rounded-xl border border-zinc-700/50 text-orange-500 shrink-0 transition-all duration-300">
            <Flame className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold truncate">ENGAGEMENT</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white mt-0.5 tracking-tight">{streakDays} Days</p>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Workspace Grid ── */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Span (Match Brain Insight & Large Scoreboard) */}
        <section className="lg:col-span-2 space-y-6" aria-label="Strategic Analysis">

          {/* Match Brain AI Hero Card */}
          {!insightDismissed && (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-xl overflow-hidden relative group transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 p-2.5 bg-emerald-950/70 text-emerald-400 rounded-xl border border-emerald-900/50">
                      <Brain className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                        TactIQ Engine · Analytical Models
                      </p>
                      <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">Today's Tactical Directive</h2>
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] font-mono px-2.5 py-0.5 bg-zinc-800 border border-zinc-700/80 rounded text-zinc-400 shadow-inner">
                    Gemini 2.5 Flash
                  </span>
                </div>

                {/* Highly Visible Recommendation Banner */}
                <div className="mt-5 bg-zinc-950/70 border border-emerald-500/15 rounded-xl p-4 sm:p-5 shadow-inner relative">
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-emerald-500 rounded-l-xl" />
                  <div className="flex items-center gap-1.5 mb-2.5 text-emerald-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI Match Brain Diagnostic</span>
                  </div>
                  {loadingInsight ? (
                    <div className="space-y-2 py-1" aria-live="polite" aria-label="Loading insight">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-full" />
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-4/6" />
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium pl-1">
                      {insight}
                    </p>
                  )}
                </div>

                {!loadingInsight && drillSuggestion && (
                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
                      <BookOpen className="w-4 h-4 shrink-0 text-zinc-500" />
                      <span className="truncate">
                        Primary Drill: <strong className="font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded ml-1 font-bold">{drillSuggestion}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => onNavigate("team")}
                        className="flex-1 sm:flex-initial h-10 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 text-xs rounded-lg transition-all font-bold border border-zinc-700/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 text-center"
                      >
                        Open Workspace
                      </button>
                      <button
                        onClick={() => setInsightDismissed(true)}
                        className="h-10 px-3 text-zinc-500 hover:text-zinc-300 text-xs transition-colors font-bold cursor-pointer"
                        aria-label="Dismiss insight"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium FotMob-Style Match Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 border-b border-zinc-800/60 pb-3.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  {nextMatch ? "Latest Match Performance" : "Next Fixture Details"}
                </span>
              </div>
              {nextMatch && matchResult && (
                <span className={`px-2.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold rounded-md border tracking-wider uppercase ${
                  matchResult === "WIN" 
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/50" 
                    : matchResult === "LOSS" 
                    ? "bg-rose-950/60 text-rose-400 border-rose-900/50" 
                    : "bg-amber-950/60 text-amber-400 border-amber-900/50"
                }`}>
                  {matchResult}
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-4">
                {/* Home Team Panel */}
                <div className="flex items-center gap-3.5 w-full sm:w-1/3 justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/40 border border-emerald-800/45 flex items-center justify-center font-display font-black text-emerald-400 text-base sm:text-lg shrink-0 shadow-inner">
                    TIQ
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-white truncate">TactIQ FC</h4>
                    <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">Home Squad</span>
                  </div>
                </div>

                {/* Match Score Display */}
                <div className="flex flex-col items-center justify-center px-6 py-2.5 bg-zinc-950 border border-zinc-800/90 rounded-2xl min-w-[130px] shadow-lg">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-white tabular-nums">
                    {nextMatch.scoreHome} – {nextMatch.scoreAway}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1 font-bold">Full Time</span>
                </div>

                {/* Away Team Panel */}
                <div className="flex items-center gap-3.5 w-full sm:w-1/3 justify-end text-right flex-row-reverse sm:flex-row">
                  <div className="min-w-0 text-left sm:text-right">
                    <h4 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[140px]" title={nextMatch.opponentName}>
                      {nextMatch.opponentName}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">Away Opponent</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 border border-zinc-800/85 flex items-center justify-center font-display font-black text-zinc-300 text-base sm:text-lg shrink-0 shadow-inner">
                    {nextMatch.opponentName.substring(0, 3).toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Create and log a game in the Team workspace to see live match analytical models here.</p>
              </div>
            )}

            {/* Scoreboard Metadata Footer */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium">Matchday: <strong className="text-white font-semibold">{nextMatch?.date || "—"}</strong></span>
                <span className="font-medium">System setup: <strong className="font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded ml-1 font-bold">{nextMatch?.formationUsed || "—"}</strong></span>
              </div>
              <button
                onClick={() => onNavigate("simulator")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer self-start sm:self-auto group h-9 px-2"
                aria-label="Open match simulator"
              >
                <span>Re-simulate Match</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </section>

        {/* Right Column (Dynamic Milestones & Progression Progress) */}
        <section className="lg:col-span-1 h-full" aria-label="Progression and Milestones">
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-6 h-full relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <h3 className="text-xs sm:text-sm font-extrabold text-white">Streak & Progress</h3>
                <span className="px-2.5 py-0.5 bg-orange-950/40 text-orange-400 text-[9px] font-mono font-bold rounded border border-orange-900/40 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {streakDays} DAY STREAK
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-zinc-400">Weekly Goal Progress</span>
                    <span className="text-white font-bold">{streakDays} / 7 Days</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative" role="progressbar" aria-valuenow={Math.min(100, (streakDays / 7) * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-700 animate-pulse"
                      style={{ width: `${Math.min(100, (streakDays / 7) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 font-semibold tracking-wide">
                    {7 - (streakDays % 7)} days left until your next coaching streak milestone
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-semibold">Tactical Standing</span>
                    <span className="font-bold text-emerald-400">{ratingLevel}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                    Your Coach level score is optimized dynamically relative to simulated outcomes, tactical board density, and direct performance ratios.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("team")}
              className="w-full text-center py-2.5 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-all rounded-xl border border-zinc-800/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
              aria-label="View detailed progress"
            >
              View Detailed Progress →
            </button>
          </div>
        </section>

      </main>

      {/* ── Recent Tactics Grid ── */}
      <section className="space-y-4" aria-label="Recent Blueprints">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Recent Tactics</h2>
            <p className="text-xs text-zinc-500 font-medium">Instantly edit existing formations or test alternate setups</p>
          </div>
          <button
            onClick={() => onNavigate("board")}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-bold flex items-center gap-1 group h-9 px-2 rounded-md"
            aria-label="View all tactics"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {tactics.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTactic(t.id)}
              className="bg-zinc-900/30 hover:bg-zinc-850/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 text-left flex flex-col justify-between gap-5 group shadow-sm hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[140px] relative overflow-hidden"
              aria-label={`Open ${t.title}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-900/30">
                  {t.formation}
                </span>
                <p className="font-bold text-zinc-200 group-hover:text-white text-xs sm:text-sm mt-3 line-clamp-2 leading-snug transition-colors">
                  {t.title}
                </p>
              </div>
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-500 font-medium border-t border-zinc-800/40 pt-2 w-full">
                <span>Updated</span>
                <span className="font-mono">{formatRelativeDate(t.updatedAt)}</span>
              </div>
            </button>
          ))}

          <button
            onClick={() => onNewTactic()}
            className="bg-zinc-950/25 hover:bg-zinc-900/40 border border-dashed border-zinc-800 hover:border-emerald-800/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3.5 group min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Create new tactic"
          >
            <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 group-hover:border-emerald-500/20 border border-transparent transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-300 font-bold transition-colors text-center">
              New Board
            </span>
          </button>
        </div>
      </section>

      {/* ── App Store Featured Style Challenge Banner ── */}
      <section className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/45 rounded-2xl border border-indigo-950/70 p-5 sm:p-6 shadow-xl relative overflow-hidden group transition-all duration-300" aria-label="Interactive Weekly Challenge">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 rounded-xl shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Weekly Challenge
                </span>
                <span className="text-[9px] px-2.5 py-0.5 bg-indigo-950/60 text-indigo-300 rounded-full font-mono border border-indigo-900/50 font-bold">
                  Resets Monday
                </span>
                <span className="text-[9px] px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-mono font-bold border border-zinc-700/50">
                  Difficulty: Hard
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                Beat a 4-3-3 high press with only 8 outfield players
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-medium">
                1,240 coaches entered this week. Clone the challenge board, deploy structured transitional lanes, and let our custom model evaluate your solution.
              </p>

              {/* Challenge Rewards Metadata Grid */}
              <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-400 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reward: <strong className="text-white">+150 XP</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Standing Bonus: <strong className="text-white">+20 Rating</strong></span>
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-enter-weekly-challenge"
            onClick={onStartChallenge}
            className="flex items-center justify-center gap-2 h-11 sm:h-12 px-6 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-950/30 hover:shadow-indigo-500/20 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 border border-indigo-500/30 self-start md:self-auto min-w-[140px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Challenge</span>
          </button>
        </div>
      </section>

    </div>
  );
}
