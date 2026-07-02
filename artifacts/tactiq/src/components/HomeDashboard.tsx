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
  BookOpen
} from "lucide-react";
import { FootballMatch, Tactic } from "../types";

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
    <div className="space-y-7 animate-fade-in p-5 md:p-7 max-w-6xl mx-auto text-gray-100 pb-24 md:pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
            {getGreeting()}, Coach.
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          id="btn-quick-new-tactic"
          onClick={() => onNewTactic()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 self-start sm:self-auto"
          aria-label="Create a new tactic board"
        >
          <Plus className="w-4 h-4" />
          New Tactic
        </button>
      </div>

      {/* ── Match Brain AI Insight ── */}
      {!insightDismissed && (
        <div className="bg-gray-900 rounded-xl border border-gray-800/80 shadow-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 p-2 bg-emerald-950/70 text-emerald-400 rounded-lg border border-emerald-900/50">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                    Match Brain · AI Insight
                  </p>
                  <h2 className="text-sm font-semibold text-white mt-0.5">Today's Tactical Recommendation</h2>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 bg-gray-800 border border-gray-700/80 rounded text-gray-400">
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="mt-4 text-sm text-gray-300 leading-relaxed border-l-2 border-emerald-500/70 pl-4">
              {loadingInsight ? (
                <div className="space-y-2 py-1" aria-live="polite" aria-label="Loading insight">
                  <div className="h-3.5 bg-gray-800 rounded animate-pulse w-full" />
                  <div className="h-3.5 bg-gray-800 rounded animate-pulse w-5/6" />
                  <div className="h-3.5 bg-gray-800 rounded animate-pulse w-4/6" />
                </div>
              ) : (
                <p>{insight}</p>
              )}
            </div>

            {!loadingInsight && drillSuggestion && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-800/80">
                <div className="flex items-center gap-2 text-xs text-gray-400 min-w-0">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">Drill: <span className="font-mono font-semibold text-emerald-400">{drillSuggestion}</span></span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate("team")}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-md transition font-medium border border-gray-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  >
                    View Training
                  </button>
                  <button
                    onClick={() => setInsightDismissed(true)}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs transition font-medium cursor-pointer"
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

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Next Fixture */}
        <div className="bg-gray-900 rounded-xl border border-gray-800/80 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
              {nextMatch ? "Last Match" : "Next Fixture"}
            </span>
            <span className="px-2 py-0.5 bg-amber-950/40 text-amber-400 text-[10px] font-mono rounded border border-amber-900/50">
              {nextMatch ? (nextMatch.scoreHome > nextMatch.scoreAway ? "WIN" : nextMatch.scoreHome < nextMatch.scoreAway ? "LOSS" : "DRAW") : "No fixtures yet"}
            </span>
          </div>

          {nextMatch ? (
            <div>
              <h3 className="text-xl font-display font-bold text-white">vs {nextMatch.opponentName}</h3>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{nextMatch.date}</span>
              </p>
              {nextMatch.scoreHome !== undefined && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg border border-gray-700">
                  <span className="text-xl font-display font-bold text-white">
                    {nextMatch.scoreHome}–{nextMatch.scoreAway}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Log a match in Team workspace to track results here.</p>
          )}

          <div className="border-t border-gray-800/80 pt-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Formation: <strong className="font-mono text-white">{nextMatch?.formationUsed || "—"}</strong>
            </span>
            <button
              onClick={() => onNavigate("simulator")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
              aria-label="Open match simulator"
            >
              Run Simulator
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Streak + Rating */}
        <div className="bg-gray-900 rounded-xl border border-gray-800/80 p-5 shadow-sm grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between border-r border-gray-800/80 pr-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-orange-500" />
                Streak
              </span>
              <h3 className="text-3xl font-display font-bold text-white mt-2 tabular-nums">{streakDays}</h3>
              <p className="text-xs text-gray-500">day{streakDays !== 1 ? "s" : ""} active</p>
            </div>
            <div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-3" role="progressbar" aria-valuenow={Math.min(100, (streakDays / 7) * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (streakDays / 7) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{7 - (streakDays % 7)} days to next milestone</p>
            </div>
          </div>

          <div className="flex flex-col justify-between pl-1">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Rating
              </span>
              <h3 className="text-3xl font-display font-bold text-white mt-2 tabular-nums">{tacticalRating}</h3>
              <p className="text-xs text-gray-500">{ratingLevel}</p>
            </div>
            <button
              onClick={() => onNavigate("team")}
              className="text-left text-xs text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer focus-visible:outline-none"
              aria-label="View detailed progress"
            >
              View progress →
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Tactics ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Tactics</h2>
          <button
            onClick={() => onNavigate("board")}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-medium flex items-center gap-1"
            aria-label="View all tactics"
          >
            See all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tactics.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTactic(t.id)}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 rounded-xl p-4 cursor-pointer transition-all text-left flex flex-col justify-between gap-3 group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[110px]"
              aria-label={`Open ${t.title}`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/30">
                  {t.formation}
                </span>
                <p className="font-semibold text-gray-200 group-hover:text-white text-sm mt-2.5 line-clamp-2 leading-snug">
                  {t.title}
                </p>
              </div>
              <p className="text-[10px] text-gray-500">{formatRelativeDate(t.updatedAt)}</p>
            </button>
          ))}

          <button
            onClick={() => onNewTactic()}
            className="bg-transparent hover:bg-gray-900/60 border border-dashed border-gray-700 hover:border-emerald-800/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group min-h-[110px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Create new tactic"
          >
            <div className="p-2 bg-gray-800/80 rounded-full text-gray-500 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 transition-all">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-300 font-medium transition-colors text-center">
              New Board
            </span>
          </button>
        </div>
      </div>

      {/* ── Weekly Challenge ── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-2.5 bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Weekly Challenge
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-950/60 text-indigo-300 rounded font-mono border border-indigo-900/40">
                  Resets Monday
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                Beat a 4-3-3 high press with only 8 outfield players
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                1,240 coaches entered this week. Clone the challenge board and let AI score your solution.
              </p>
            </div>
          </div>
          <button
            id="btn-enter-weekly-challenge"
            onClick={onStartChallenge}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Enter Challenge
          </button>
        </div>
      </div>

    </div>
  );
}
