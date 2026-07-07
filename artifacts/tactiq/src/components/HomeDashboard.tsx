import { useState, useEffect } from "react";
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
  Play
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
  const ratingLevel = getRatingLevel(tacticalRating);

  return (
    <div className="space-y-8 animate-fade-in p-4 sm:p-6 md:p-8 max-w-7xl mx-auto text-zinc-100 pb-24 md:pb-12">

      {/* ── Welcome Header with Quick Action Buttons ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-zinc-800/80 pb-8">
        <div className="space-y-2">
          <LogoFull className="h-8 md:h-9 mb-2 opacity-95" />
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">
            {getGreeting()}, Coach.
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Ready to fine-tune your setup? Review tactical data, run direct matchday simulations, and lead your squad to victory.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/35 border border-emerald-900/40 px-2.5 py-1 rounded-full mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            id="btn-quick-new-tactic"
            onClick={() => onNewTactic()}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 border border-emerald-500/30"
            aria-label="Create a new tactic board"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Tactic</span>
          </button>

          <button
            onClick={() => onNavigate("team")}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-200 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer border border-zinc-800 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Go to Team Workspace"
          >
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Team</span>
          </button>

          <button
            onClick={() => onNavigate("simulator")}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-200 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer border border-zinc-800 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Go to Match Simulator"
          >
            <Play className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulator</span>
          </button>
        </div>
      </div>

      {/* ── Dashboard Summary Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Tactics */}
        <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/80 rounded-xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-emerald-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">Total Tactics</p>
            <p className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">{tactics.length}</p>
          </div>
        </div>

        {/* Stat Card 2: Matches Played */}
        <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/80 rounded-xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-emerald-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">Matches Played</p>
            <p className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">{matches.length}</p>
          </div>
        </div>

        {/* Stat Card 3: Tactical Rating */}
        <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/80 rounded-xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-amber-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">Tactical Rating</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <p className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">{tacticalRating}</p>
              <span className="text-[10px] text-zinc-400 truncate max-w-[90px]" title={ratingLevel}>{ratingLevel}</span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Current Streak */}
        <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/80 rounded-xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:border-zinc-700/80 transition-all">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-orange-500 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">Active Streak</p>
            <p className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">{streakDays} Days</p>
          </div>
        </div>
      </div>

      {/* ── Primary Content Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Columns (AI Insight & Latest Match Card) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Match Brain AI Insight */}
          {!insightDismissed && (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 p-2 bg-emerald-950/70 text-emerald-400 rounded-lg border border-emerald-900/50">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                        Match Brain · Cognitive Insights
                      </p>
                      <h2 className="text-base font-bold text-white mt-0.5">Today's Performance Breakdown</h2>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/80 rounded text-zinc-400">
                    Gemini 2.5 Flash
                  </span>
                </div>

                {/* Highly Visible Recommendation Banner */}
                <div className="mt-5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Diagnosis & Training Focus</span>
                  </div>
                  {loadingInsight ? (
                    <div className="space-y-2 py-1" aria-live="polite" aria-label="Loading insight">
                      <div className="h-4 bg-zinc-800/80 rounded animate-pulse w-full" />
                      <div className="h-4 bg-zinc-800/80 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-zinc-800/80 rounded animate-pulse w-4/6" />
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                      {insight}
                    </p>
                  )}
                </div>

                {!loadingInsight && drillSuggestion && (
                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2.5 text-xs text-zinc-400 min-w-0">
                      <BookOpen className="w-4 h-4 shrink-0 text-zinc-500" />
                      <span className="truncate">
                        Recommended Drill: <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 ml-1">{drillSuggestion}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate("team")}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition font-semibold border border-zinc-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      >
                        View Training
                      </button>
                      <button
                        onClick={() => setInsightDismissed(true)}
                        className="px-3 py-2 text-zinc-500 hover:text-zinc-300 text-xs transition font-semibold cursor-pointer"
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

          {/* Premium Scoreboard card (Latest Match) */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 border-b border-zinc-800/60 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  {nextMatch ? "Latest Match Performance" : "Next Fixture Details"}
                </span>
              </div>
              {nextMatch && (
                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded border tracking-wide uppercase ${
                  nextMatch.scoreHome > nextMatch.scoreAway 
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/50" 
                    : nextMatch.scoreHome < nextMatch.scoreAway 
                    ? "bg-rose-950/60 text-rose-400 border-rose-900/50" 
                    : "bg-amber-950/60 text-amber-400 border-amber-900/50"
                }`}>
                  {nextMatch.scoreHome > nextMatch.scoreAway ? "WIN" : nextMatch.scoreHome < nextMatch.scoreAway ? "LOSS" : "DRAW"}
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                {/* Home Team */}
                <div className="flex items-center gap-4 w-full md:w-1/3 justify-start">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center font-display font-black text-emerald-400 text-lg">
                    TIQ
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">TactIQ FC</h4>
                    <span className="text-xs text-zinc-500">Home</span>
                  </div>
                </div>

                {/* Score display */}
                <div className="flex flex-col items-center justify-center px-6 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl min-w-[130px] shadow-inner">
                  <span className="text-3xl md:text-4xl font-mono font-extrabold tracking-tight text-white tabular-nums">
                    {nextMatch.scoreHome} – {nextMatch.scoreAway}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-1.5">Full Time</span>
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-4 w-full md:w-1/3 justify-end md:text-right flex-row-reverse md:flex-row">
                  <div className="text-right">
                    <h4 className="text-base font-bold text-white truncate max-w-[150px]">{nextMatch.opponentName}</h4>
                    <span className="text-xs text-zinc-500">Away</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-display font-black text-zinc-300 text-lg">
                    {nextMatch.opponentName.substring(0, 3).toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-500">Log a match in the Team workspace to view detailed analytics and performance ratings here.</p>
              </div>
            )}

            {/* Footer Info of Match Card */}
            <div className="mt-6 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-4">
                <span>Date: <strong className="text-white">{nextMatch?.date || "—"}</strong></span>
                <span>Formation: <strong className="font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded">{nextMatch?.formationUsed || "—"}</strong></span>
              </div>
              <button
                onClick={() => onNavigate("simulator")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer self-start sm:self-auto group"
                aria-label="Open match simulator"
              >
                <span>Re-simulate Match</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Streak Milestone Visualizer) */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 p-6 shadow-xl flex flex-col justify-between gap-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <h3 className="text-sm font-extrabold text-white">Streak & Progress</h3>
                <span className="px-2.5 py-0.5 bg-orange-950/40 text-orange-400 text-[10px] font-mono font-bold rounded border border-orange-900/50 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {streakDays} DAY STREAK
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400 font-semibold">Weekly Goal Progress</span>
                    <span className="font-bold text-white">{streakDays}/7 Days</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, (streakDays / 7) * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (streakDays / 7) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 font-medium">{7 - (streakDays % 7)} days to next major milestone achievement</p>
                </div>

                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-semibold">Tactical Level</span>
                    <span className="font-bold text-emerald-400">{ratingLevel}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                    Your Coach level is updated based on simulated outcomes, match accuracy statistics, and direct tactical design depth.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("team")}
              className="w-full text-center py-2.5 bg-zinc-950/80 hover:bg-zinc-800 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-all rounded-lg border border-zinc-800 cursor-pointer focus-visible:outline-none hover:border-zinc-700"
              aria-label="View detailed progress"
            >
              View Detailed Progress →
            </button>
          </div>
        </div>

      </div>

      {/* ── Recent Tactics Workspace ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white">Recent Tactics</h2>
            <p className="text-xs text-zinc-500">Quickly jump back into your recent defensive or attacking setups</p>
          </div>
          <button
            onClick={() => onNavigate("board")}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-bold flex items-center gap-1 group"
            aria-label="View all tactics"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tactics.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTactic(t.id)}
              className="bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 cursor-pointer transition-all duration-300 text-left flex flex-col justify-between gap-4 group shadow-sm hover:shadow-md hover:shadow-emerald-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[130px] relative overflow-hidden"
              aria-label={`Open ${t.title}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                  {t.formation}
                </span>
                <p className="font-bold text-zinc-200 group-hover:text-white text-sm mt-3 line-clamp-2 leading-snug transition-colors">
                  {t.title}
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>Modified</span>
                <span className="font-mono">{formatRelativeDate(t.updatedAt)}</span>
              </div>
            </button>
          ))}

          <button
            onClick={() => onNewTactic()}
            className="bg-zinc-950/20 hover:bg-zinc-900/40 border border-dashed border-zinc-800 hover:border-emerald-800/60 rounded-xl p-5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 group min-h-[130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Create new tactic"
          >
            <div className="p-2.5 bg-zinc-900 rounded-full text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 group-hover:border-emerald-500/20 border border-transparent transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-300 font-semibold transition-colors text-center">
              New Board
            </span>
          </button>
        </div>
      </div>

      {/* ── Premium Weekly Challenge Banner ── */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/30 rounded-2xl border border-indigo-950/60 p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-indigo-950/50 text-indigo-400 border border-indigo-800/40 rounded-xl shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Weekly Challenge
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-950/60 text-indigo-300 rounded-full font-mono border border-indigo-900/40">
                  Resets Monday
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                Beat a 4-3-3 high press with only 8 outfield players
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                1,240 coaches entered this week. Clone the challenge board and let our custom AI engine score your counter-tactical solution.
              </p>
            </div>
          </div>
          <button
            id="btn-enter-weekly-challenge"
            onClick={onStartChallenge}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-950/30 hover:shadow-indigo-500/20 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 border border-indigo-500/30 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Challenge</span>
          </button>
        </div>
      </div>

    </div>
  );
}
