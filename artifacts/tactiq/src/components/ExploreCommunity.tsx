import { useState, useMemo } from "react";
import {
  Award,
  Heart,
  GitBranch,
  Search,
  Compass,
  ChevronRight,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { toast } from "./Toast";
import { LogoIcon } from "./Logo";

interface ExploreCommunityProps {
  onStartChallenge: () => void;
  onNewTactic: (formation?: string) => void;
}

const COMMUNITY_TACTICS = [
  {
    id: "c-1",
    title: "4-3-3 High Block Aggressive Shifting",
    creator: "@CoachMarcos",
    formation: "4-3-3",
    likes: 847,
    comments: 84,
    desc: "An aggressive pressing framework designed to trap central midfielders in their own build-up third.",
    tag: "Pressing",
    tagColor: "emerald"
  },
  {
    id: "c-2",
    title: "3-5-2 Narrow Possession Block",
    creator: "@TacticsPriya",
    formation: "3-5-2",
    likes: 612,
    comments: 61,
    desc: "UEFA-B certified framework exploiting central overloads with dynamic wingback coverage.",
    tag: "Possession",
    tagColor: "sky"
  },
  {
    id: "c-3",
    title: "4-2-3-1 Low-Block Transition Defense",
    creator: "@GafferNiels",
    formation: "4-2-3-1",
    likes: 421,
    comments: 42,
    desc: "Funnels counter-attacks into defensive channels before triggering a coordinated offside trap.",
    tag: "Defensive",
    tagColor: "red"
  },
  {
    id: "c-4",
    title: "Box Midfield 3-2-4-1 Possession Shape",
    creator: "@AnalystJoe",
    formation: "3-5-2",
    likes: 1250,
    comments: 125,
    desc: "Box midfield construction in possession, utilising a centerback stepping into the DM line to create a numerical overload.",
    tag: "Possession",
    tagColor: "sky"
  },
  {
    id: "c-5",
    title: "4-4-2 Compact Mid-Block Counter",
    creator: "@BlockMasterFC",
    formation: "4-4-2",
    likes: 389,
    comments: 38,
    desc: "Two flat lines of four creates a compact mid-block that absorbs pressure and launches rapid vertical transitions.",
    tag: "Counter",
    tagColor: "amber"
  },
  {
    id: "c-6",
    title: "High Fullback 4-3-3 with Inverted Wingers",
    creator: "@PressurePete",
    formation: "4-3-3",
    likes: 703,
    comments: 70,
    desc: "Fullbacks push high into the half-space as inverted wingers cut inside to overload the box with late runs.",
    tag: "Attacking",
    tagColor: "violet"
  }
];

const FILTERS = [
  { id: "foryou", label: "For You" },
  { id: "top", label: "Top This Week" },
  { id: "formation", label: "By Formation" },
] as const;

type FilterId = typeof FILTERS[number]["id"];

const tagColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-950/50 border-emerald-900/40",
  sky:     "text-sky-400 bg-sky-950/50 border-sky-900/40",
  red:     "text-red-400 bg-red-950/50 border-red-900/40",
  amber:   "text-amber-400 bg-amber-950/50 border-amber-900/40",
  violet:  "text-violet-400 bg-violet-950/50 border-violet-900/40",
};

export default function ExploreCommunity({
  onStartChallenge,
  onNewTactic
}: ExploreCommunityProps) {
  const [filter, setFilter] = useState<FilterId>("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = (id: string, title: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Removed like", { description: title, duration: 1800 });
      } else {
        next.add(id);
        toast.success("Liked!", { description: title, duration: 1800 });
      }
      return next;
    });
  };

  const handleClone = (formation: string, title: string) => {
    onNewTactic(formation);
    toast.success("Board cloned to your workspace", {
      description: title,
      duration: 3000,
    });
  };

  const filteredTactics = useMemo(() => {
    let result = [...COMMUNITY_TACTICS];

    if (filter === "top") {
      result = result.sort((a, b) => b.likes - a.likes);
    } else if (filter === "formation") {
      result = result.sort((a, b) => a.formation.localeCompare(b.formation));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.formation.toLowerCase().includes(q) ||
          t.creator.toLowerCase().includes(q) ||
          t.tag.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in p-5 md:p-7 max-w-6xl mx-auto text-gray-100 pb-24 md:pb-8">

      {/* ── Header ── */}
      <div className="border-b border-gray-800/80 pb-5">
        <LogoIcon className="w-8 h-8 mb-3" />
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-400">
            Community Hub
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
          Explore Tactics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Browse verified formations, clone templates, and enter live tactical challenges.
        </p>
      </div>

      {/* ── Weekly Challenge ── */}
      <div className="relative bg-gray-900 border border-indigo-900/50 rounded-xl p-5 md:p-6 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950 border border-indigo-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                Weekly Challenge
              </span>
              <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                3 days left
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold font-display text-white leading-snug">
              Beat a 4-3-3 high press with only 8 outfield players
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
              Configure your build-up shape with a numerical disadvantage to crack open the opponent's pressing structure. Your solution is scored by Match Brain AI.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 1,240 entries</span>
              <span>·</span>
              <span>Resets Monday</span>
            </div>
          </div>
          <button
            id="btn-explore-weekly-enter"
            onClick={onStartChallenge}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Enter Challenge
          </button>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                filter === f.id
                  ? "bg-emerald-950/50 border-emerald-700 text-emerald-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
              }`}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-explore-search"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search formations, tags..."
            aria-label="Search tactics"
            className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-600 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none text-white placeholder:text-gray-600 transition-colors"
          />
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div>
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          Featured Tactics
          {filteredTactics.length !== COMMUNITY_TACTICS.length && (
            <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
              {filteredTactics.length} result{filteredTactics.length !== 1 ? "s" : ""}
            </span>
          )}
        </h3>

        {filteredTactics.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-3 text-gray-700" />
            <p className="text-sm font-medium">No tactics match your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 cursor-pointer transition"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTactics.map((t) => {
              const isLiked = likedIds.has(t.id);
              const likeCount = t.likes + (isLiked ? 1 : 0);
              return (
                <div
                  key={t.id}
                  className="bg-gray-900 border border-gray-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-gray-700 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                          {t.formation}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${tagColors[t.tagColor] ?? tagColors.emerald}`}>
                          {t.tag}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{t.creator}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm leading-snug">
                      {t.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>

                  <div className="border-t border-gray-800/80 pt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(t.id, t.title)}
                        aria-label={isLiked ? `Unlike ${t.title}` : `Like ${t.title}`}
                        aria-pressed={isLiked}
                        className={`flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-none rounded ${
                          isLiked ? "text-rose-400" : "hover:text-gray-300"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-all ${isLiked ? "fill-rose-400 text-rose-400 scale-110" : ""}`} />
                        <span className="tabular-nums">{likeCount.toLocaleString()}</span>
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{t.comments}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleClone(t.formation, t.title)}
                      aria-label={`Clone ${t.title} into your workspace`}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-400 transition-colors font-semibold cursor-pointer focus-visible:outline-none rounded"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Clone Board
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
