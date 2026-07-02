import { useState } from "react";
import { 
  Award, 
  Heart, 
  Download, 
  Filter, 
  Search, 
  Compass, 
  ShieldAlert, 
  ChevronRight,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface ExploreCommunityProps {
  onStartChallenge: () => void;
  onNewTactic: (formation?: string) => void;
}

export default function ExploreCommunity({
  onStartChallenge,
  onNewTactic
}: ExploreCommunityProps) {
  const [filter, setFilter] = useState<"foryou" | "top" | "formation" | "challenges">("foryou");

  // Mock highly stylized community cards from the PRD
  const communityTactics = [
    {
      id: "c-1",
      title: "4-3-3 High Block Aggressive Shifting",
      creator: "@CoachMarcos",
      formation: "4-3-3",
      likes: 847,
      clones: 234,
      desc: "An aggressive pressing framework designed to trap central midfielders in their own build-up third."
    },
    {
      id: "c-2",
      title: "3-5-2 Narrow Possession Block",
      creator: "@TacticsPriya",
      formation: "3-5-2",
      likes: 612,
      clones: 189,
      desc: "UEFA-B certified tactical plan exploiting central overloads with dynamic wingback coverage."
    },
    {
      id: "c-3",
      title: "4-2-3-1 Low-Block Transition Defense",
      creator: "@GafferNiels",
      formation: "4-2-3-1",
      likes: 421,
      clones: 95,
      desc: "Funnels counter-attacks into defensive channels before triggering an offside trap."
    },
    {
      id: "c-4",
      title: "Pep's 2023 Champions League 3-2-4-1",
      creator: "@AnalystJoe",
      formation: "3-5-2",
      likes: 1250,
      clones: 504,
      desc: "Box midfield box construction in possession utilizing a centerback stepping into DM lines."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto text-gray-100">
      
      {/* Header with discovery title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-5 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/40">
            Community Discovery Hub
          </span>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mt-3">
            Tactics Explore
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse verified structures, clone templates, and enter live tactical challenge debates.
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-900/40 border border-gray-800 p-4 rounded-xl">
        <div className="flex flex-wrap gap-2">
          <button
            id="filter-for-you"
            onClick={() => setFilter("foryou")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              filter === "foryou"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            For You
          </button>
          <button
            id="filter-top"
            onClick={() => setFilter("top")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              filter === "top"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Top This Week
          </button>
          <button
            id="filter-formation"
            onClick={() => setFilter("formation")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              filter === "formation"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            By Formation
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-explore-search"
            type="text"
            placeholder="Search templates..."
            className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none text-white"
          />
        </div>
      </div>

      {/* WEEKLY CHALLENGE FOCUS BLOCK */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-indigo-950/15 to-transparent border border-indigo-900/60 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
              WEEKLY CONFLICT CHALLENGE
            </span>
            <span className="text-xs text-indigo-300 font-semibold">3 Days Left</span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            "Beat a 4-3-3 high press with only 8 outfield players"
          </h2>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Configure your build-up coordinates with numerical constraints to crack open the opposition pressing lines. Clone the challenge board and let AI score your performance.
          </p>
        </div>

        <button
          id="btn-explore-weekly-enter"
          onClick={onStartChallenge}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition shrink-0 cursor-pointer shadow-md"
        >
          Enter Challenge Board
        </button>
      </div>

      {/* DISCOVERED BOARDS GRID */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base">Featured Shared Layouts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {communityTactics.map((t) => (
            <div 
              key={t.id}
              className="bg-gray-900 border border-gray-850 rounded-xl p-5 shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-2 py-0.5 rounded font-bold">
                      {t.formation}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{t.creator}</span>
                  </div>
                  
                  {/* AI quality checked badge */}
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                    <span>AI Verified</span>
                  </span>
                </div>

                <h4 className="font-bold text-white text-base leading-tight hover:text-emerald-400 transition cursor-pointer">
                  {t.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {t.desc}
                </p>
              </div>

              {/* Card Footer interaction statistics */}
              <div className="border-t border-gray-850/80 pt-3.5 flex items-center justify-between text-xs text-gray-500">
                <div className="flex gap-4">
                  <button 
                    onClick={() => alert("Liked!")}
                    className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                    <span>{t.likes}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    <span>{Math.round(t.likes / 10)}</span>
                  </span>
                </div>

                <button 
                  onClick={() => {
                    onNewTactic(t.formation);
                    alert(`Cloned structure: ${t.title} into your workspace!`);
                  }}
                  className="flex items-center gap-1 hover:text-emerald-400 transition font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Clone Board</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
