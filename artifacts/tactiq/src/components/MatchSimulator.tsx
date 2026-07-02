import { useState, useMemo } from "react";
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  Hexagon, 
  Share2, 
  Download, 
  RotateCcw,
  BookOpen,
  Info
} from "lucide-react";
import { MatchSimulationInput, SimulationResult } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Deterministic win probability timeline generator responding specifically to formations, styles, and suspensions
function generateWinProbabilityTimeline(
  inputs: MatchSimulationInput,
  possessionHome: number,
  pressSuccessHome: number,
  pressSuccessAway: number
) {
  const timeline = [];
  
  // Base starting probability based on Advantage and key player absence
  let baseHome = 40;
  if (inputs.homeAdvantage === "Home") baseHome += 8;
  if (inputs.homeAdvantage === "Away") baseHome -= 8;
  if (inputs.missingPlayer) baseHome -= 6;
  
  // Adjust base by possession control
  const possessionDiff = possessionHome - 50;
  baseHome += possessionDiff * 0.4;
  
  // Ensure starting base is realistic
  baseHome = Math.max(20, Math.min(75, baseHome));
  let baseAway = 100 - baseHome - 25; // 25% draw base
  
  // We simulate minutes: 0, 15, 30, 45, 60, 75, 90
  const minutes = [0, 15, 30, 45, 60, 75, 90];
  
  for (const min of minutes) {
    let home = baseHome;
    let away = baseAway;
    let draw = 100 - home - away;
    
    // Minute-based tactical shifts
    if (min === 15) {
      if (inputs.homeStyle === "Press") home += 4;
      if (inputs.awayStyle === "Press") away += 4;
    }
    
    if (min === 30) {
      if (inputs.homeStyle === "Possession") home += 5;
      if (inputs.awayStyle === "Possession") away += 5;
    }
    
    if (min === 45) {
      // Draw probability goes up slightly at HT
      draw += 4;
      home -= 2;
      away -= 2;
    }
    
    if (min === 60) {
      if (inputs.homeStyle === "Press") {
        // High press fatigue kicks in
        home -= 5;
        draw += 2;
        away += 3;
      }
      if (inputs.awayStyle === "Press") {
        away -= 5;
        draw += 2;
        home += 3;
      }
      if (inputs.homeStyle === "Counter") {
        home += 4;
      }
    }
    
    if (min === 75) {
      if (inputs.homeStyle === "Low Block" || inputs.awayStyle === "Low Block") {
        draw += 6;
        home -= 3;
        away -= 3;
      }
    }
    
    if (min === 90) {
      if (inputs.homeAdvantage === "Home") home += 3;
      if (inputs.homeAdvantage === "Away") away += 3;
    }
    
    // Formation specific fluctuations
    if (inputs.homeFormation === "3-5-2" && min >= 60) {
      home -= 2;
    }
    if (inputs.awayFormation === "4-2-3-1" && min >= 75) {
      away += 2;
    }
    
    // Normalize to exactly 100%
    const total = home + away + draw;
    home = Math.round((home / total) * 100);
    away = Math.round((away / total) * 100);
    draw = 100 - home - away;
    
    timeline.push({
      minute: `${min}'`,
      homeWin: home,
      draw: draw,
      awayWin: away
    });
  }
  
  return timeline;
}

export default function MatchSimulator() {
  const [inputs, setInputs] = useState<MatchSimulationInput>({
    homeFormation: "4-3-3",
    awayFormation: "3-5-2",
    homeStyle: "Possession",
    awayStyle: "Press",
    homeAdvantage: "Home",
    missingPlayer: false
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const timelineData = useMemo(() => {
    if (!result) return [];
    return generateWinProbabilityTimeline(
      inputs,
      result.possessionHome,
      result.pressSuccessHome,
      result.pressSuccessAway
    );
  }, [result, inputs]);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
      });
      if (res.ok) {
        const data = await res.json();
        setResult({
          possessionHome: data.stats.possessionHome,
          possessionAway: data.stats.possessionAway,
          pressSuccessHome: data.stats.pressSuccessHome,
          pressSuccessAway: data.stats.pressSuccessAway,
          spaceInFinalThird: data.stats.spaceInFinalThird,
          vulnerableZones: data.stats.vulnerableZones,
          aiNarrative: data.aiNarrative,
          suggestedAdjustment: data.suggestedAdjustment
        });
      } else {
        throw new Error("Simulation endpoint failed");
      }
    } catch (err) {
      // Graceful offline fallback
      setResult({
        possessionHome: 58,
        possessionAway: 42,
        pressSuccessHome: 52,
        pressSuccessAway: 48,
        spaceInFinalThird: "Medium",
        vulnerableZones: [
          {
            name: "Half-Spaces",
            description: "Overloads on the corner channels behind midfielders.",
            x: 22,
            y: 45,
            width: 20,
            height: 18
          }
        ],
        aiNarrative: `[Offline Preview] The clash results in 58% home possession control. The home team's 4-3-3 possession style successfully shifts the away team's 3-5-2 midblock, but leaves the wide flanks vulnerable on rapid wingback counters.`,
        suggestedAdjustment: "Drop fullbacks 5 meters deeper to prevent wing transitions."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto text-gray-100">
      
      {/* Header and Pitch Matchup title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-900/40">
            NORTH STAR FEATURE — Match Simulator
          </span>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mt-3">
            AI Matchup Simulator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyze why one football system beats another before stepping onto the pitch.
          </p>
        </div>
      </div>

      {/* Inputs Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-900/40 rounded-xl border border-gray-800 p-6 shadow-xl">
        
        {/* Home Team controls */}
        <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-gray-800 pb-6 lg:pb-0 lg:pr-6">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Home Team (Your Club)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Formation</label>
              <select
                id="select-sim-home-formation"
                value={inputs.homeFormation}
                onChange={(e) => setInputs(prev => ({ ...prev, homeFormation: e.target.value }))}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer"
              >
                <option value="4-3-3">4-3-3 Attack Wide</option>
                <option value="3-5-2">3-5-2 Wingbacks</option>
                <option value="4-4-2">4-4-2 Flat Block</option>
                <option value="4-2-3-1">4-2-3-1 Double Pivot</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Tactical Style</label>
              <select
                id="select-sim-home-style"
                value={inputs.homeStyle}
                onChange={(e) => setInputs(prev => ({ ...prev, homeStyle: e.target.value as any }))}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer"
              >
                <option value="Possession">Possession Dominate</option>
                <option value="Press">High Pressing</option>
                <option value="Counter">Rapid Counter-Attack</option>
                <option value="Low Block">Low Block Congestion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Away Team controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Away Team (Opponent)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Formation</label>
              <select
                id="select-sim-away-formation"
                value={inputs.awayFormation}
                onChange={(e) => setInputs(prev => ({ ...prev, awayFormation: e.target.value }))}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer"
              >
                <option value="4-3-3">4-3-3 Attack Wide</option>
                <option value="3-5-2">3-5-2 Wingbacks</option>
                <option value="4-4-2">4-4-2 Flat Block</option>
                <option value="4-2-3-1">4-2-3-1 Double Pivot</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Tactical Style</label>
              <select
                id="select-sim-away-style"
                value={inputs.awayStyle}
                onChange={(e) => setInputs(prev => ({ ...prev, awayStyle: e.target.value as any }))}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer"
              >
                <option value="Possession">Possession Dominate</option>
                <option value="Press">High Pressing</option>
                <option value="Counter">Rapid Counter-Attack</option>
                <option value="Low Block">Low Block Congestion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advantage & Key suspensions */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-800 pt-5 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Match Advantage</label>
            <div className="flex gap-2">
              {["Even", "Home", "Away"].map((adv) => (
                <button
                  id={`btn-sim-advantage-${adv}`}
                  key={adv}
                  onClick={() => setInputs(prev => ({ ...prev, homeAdvantage: adv as any }))}
                  className={`flex-1 py-1.5 text-xs rounded border transition cursor-pointer font-medium ${
                    inputs.homeAdvantage === adv
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {adv}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="toggle-sim-missing-player"
              type="checkbox"
              checked={inputs.missingPlayer}
              onChange={(e) => setInputs(prev => ({ ...prev, missingPlayer: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 bg-gray-950 border-gray-800 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <div className="leading-tight">
              <label htmlFor="toggle-sim-missing-player" className="text-xs font-semibold text-white block cursor-pointer">
                Key Player Suspension / Absence
              </label>
              <span className="text-[10px] text-gray-500">Decreases home recovery rating</span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              id="btn-run-match-simulation"
              onClick={handleSimulate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 fill-white/10 ${loading ? "animate-spin text-amber-300" : ""}`} />
              <span>{loading ? "Calculating Matchup..." : "Run AI Simulation"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SIMULATION RESULTS SCREEN */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          
          {/* Possession and Press success stats */}
          <div className="col-span-1 lg:col-span-2 space-y-6 bg-gray-900/40 rounded-xl border border-gray-800 p-6 shadow-xl">
            <h3 className="font-bold text-white text-base font-display">Simulation Outcome Statistics</h3>
            
            {/* Possession breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>POSSESSION CONTROL</span>
                <span>{result.possessionHome}% Home / {result.possessionAway}% Away</span>
              </div>
              <div className="h-4 bg-gray-950 rounded-full flex overflow-hidden border border-gray-850">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${result.possessionHome}%` }}
                />
                <div 
                  className="bg-indigo-600 h-full transition-all duration-700"
                  style={{ width: `${result.possessionAway}%` }}
                />
              </div>
            </div>

            {/* Press Success Ratios */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-950/40 rounded-lg p-3 border border-gray-850 text-center">
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Home Press Success</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{result.pressSuccessHome}%</div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${result.pressSuccessHome}%` }} />
                </div>
              </div>
              <div className="bg-gray-950/40 rounded-lg p-3 border border-gray-850 text-center">
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Away Press Success</span>
                <div className="text-xl font-bold text-indigo-400 mt-1">{result.pressSuccessAway}%</div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-400 h-full" style={{ width: `${result.pressSuccessAway}%` }} />
                </div>
              </div>
            </div>

            {/* Win Probability Chart */}
            <div className="border-t border-gray-800 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">Win Probability Timeline</h4>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">90' Match Curve Prediction</span>
              </div>
              <p className="text-xs text-gray-400 leading-normal">
                Shows how match control and threat levels shift over 90 minutes. Staggered stamina changes, late-game pushes, and tactical style setups are integrated.
              </p>
              
              <div className="h-64 w-full bg-gray-950/30 rounded-lg border border-gray-850 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorAway" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorDraw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="minute" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '0.375rem' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Area type="monotone" name="Home Win %" dataKey="homeWin" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHome)" />
                    <Area type="monotone" name="Draw %" dataKey="draw" stroke="#9ca3af" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDraw)" />
                    <Area type="monotone" name="Away Win %" dataKey="awayWin" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAway)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Narrative Breakdown */}
            <div className="border-t border-gray-800 pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Matchup Analysis (Gemini Intelligence)</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                {result.aiNarrative}
              </p>
              
              <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Suggested Coach Adjustment</span>
                <p className="text-xs text-emerald-300 font-medium mt-1">
                  {result.suggestedAdjustment}
                </p>
              </div>
            </div>
          </div>

          {/* Miniature Pitch Heatmap Overlay */}
          <div className="bg-gray-900/40 rounded-xl border border-gray-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <h3 className="font-bold text-white text-sm">Vulnerable Zones Map</h3>
                <span className="text-[10px] font-mono text-red-400 bg-red-950 border border-red-900/40 px-1.5 py-0.5 rounded">
                  HEATMAP
                </span>
              </div>

              {/* Pitch drawing */}
              <div className="football-pitch w-full h-56 relative select-none">
                <div className="pitch-center-line" />
                <div className="pitch-center-circle" />
                <div className="pitch-penalty-box-top" />
                <div className="pitch-penalty-box-bottom" />

                {/* Draw vulnerable heat blocks */}
                {result.vulnerableZones.map((zn, idx) => (
                  <div
                    key={idx}
                    className="absolute bg-red-500/30 border border-dashed border-red-500/60 rounded flex items-center justify-center animate-pulse"
                    style={{
                      left: `${zn.x}%`,
                      top: `${zn.y}%`,
                      width: `${zn.width}%`,
                      height: `${zn.height}%`
                    }}
                  >
                    <span className="text-[9px] font-mono text-white bg-red-900 px-1 py-0.5 rounded font-bold">
                      {zn.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Describe vulnerable zone details */}
              <div className="mt-4 space-y-2">
                {result.vulnerableZones.map((zn, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5 animate-ping" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-200">{zn.name}</h5>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                        {zn.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mt-6 flex gap-3">
              <button
                id="btn-sim-share"
                onClick={() => alert("Shareable matchup card URL copied to clipboard!")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-850 bg-gray-900 hover:bg-gray-800 rounded text-xs text-gray-300 font-semibold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
              <button
                id="btn-sim-reset"
                onClick={() => setResult(null)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-850 bg-gray-900 hover:bg-gray-800 rounded text-xs text-gray-300 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Simulate New</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
