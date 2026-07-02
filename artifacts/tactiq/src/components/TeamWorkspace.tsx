import React, { useState, useMemo } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Plus, 
  Brain, 
  Trash2, 
  Clock, 
  Share2, 
  CheckSquare, 
  Award,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Database,
  TrendingUp,
  Sliders,
  Shield,
  Gauge
} from "lucide-react";
import { Player, FootballMatch, TrainingSession, SessionDrill } from "../types";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip
} from "recharts";

const getPlayerAttributes = (player: Player) => {
  const baseValue = (player.name.charCodeAt(0) % 15) + 75; // a value between 75 and 90
  
  let speed = player.speed ?? (baseValue + (player.name.charCodeAt(1) % 10) - 5);
  let passing = player.passing ?? (baseValue + (player.name.charCodeAt(2) % 10) - 5);
  let positioning = player.positioning ?? (baseValue + (player.name.charCodeAt(3) % 10) - 5);
  let defending = player.defending ?? (baseValue + (player.name.charCodeAt(4) % 10) - 5);
  let shooting = player.shooting ?? (baseValue + (player.name.charCodeAt(5) % 10) - 5);
  let stamina = player.stamina ?? (baseValue + (player.name.charCodeAt(6) % 10) - 5);

  // Role based adjustments
  if (player.role === "ATT") {
    speed = Math.min(99, speed + 8);
    shooting = Math.min(99, shooting + 10);
    passing = Math.min(99, passing + 2);
    defending = Math.max(30, defending - 25);
  } else if (player.role === "MID") {
    passing = Math.min(99, passing + 12);
    positioning = Math.min(99, positioning + 8);
    speed = Math.min(95, speed + 2);
    defending = Math.min(90, defending + 5);
  } else if (player.role === "DEF") {
    defending = Math.min(99, defending + 15);
    positioning = Math.min(99, positioning + 8);
    speed = Math.min(90, speed - 2);
    shooting = Math.max(30, shooting - 20);
  } else if (player.role === "GK") {
    defending = Math.min(99, defending + 10);
    positioning = Math.min(99, positioning + 15);
    speed = Math.max(40, speed - 15);
    shooting = Math.max(20, shooting - 40);
    passing = Math.min(90, passing + 5);
  }

  // Bound between 10 and 99
  const clamp = (val: number) => Math.max(10, Math.min(99, Math.round(val)));

  return {
    speed: clamp(speed),
    passing: clamp(passing),
    positioning: clamp(positioning),
    defending: clamp(defending),
    shooting: clamp(shooting),
    stamina: clamp(stamina),
  };
};

interface TrainingTemplate {
  id: string;
  title: string;
  description: string;
  category: "Possession" | "Set Pieces" | "Attacking" | "Defending" | "Conditioning";
  goalText: string;
  durationMins: number;
  playerCount: number;
  drills: SessionDrill[];
}

const PRE_BUILT_TEMPLATES: TrainingTemplate[] = [
  {
    id: "possession-triangles",
    title: "Possession: Triangle Circulation",
    description: "Develop rapid ball movement, triangles, and transitional pressing in tight spaces.",
    category: "Possession",
    goalText: "Develop rapid ball circulation, triangle pass lanes, and immediate transition recovery.",
    durationMins: 60,
    playerCount: 14,
    drills: [
      {
        name: "3v3+2 Possession Rondo",
        duration: 15,
        description: "Maintain possession in a 15x15m grid with two neutral players facilitating quick triangles and third-man release runs.",
        coachingCues: ["Speed of release (maximum two-touch)", "Shape triangles continuously", "Immediate press upon loss"],
        equipment: ["8 Cones", "Bibs (2 colors)", "Balls"]
      },
      {
        name: "4v4 Directional Possession",
        duration: 25,
        description: "Teams score points by circulating the ball and successfully playing it from one end-line target player to another.",
        coachingCues: ["Body shape to receive on the half-turn", "Identify forward passing channels", "Support behind the ball"],
        equipment: ["10 Cones", "Bibs", "6 Balls"]
      },
      {
        name: "Conditioned Scrimmage (7v7)",
        duration: 20,
        description: "7v7 match where a sequence of 6 consecutive passes before scoring adds 3 extra points. Encourages patience.",
        coachingCues: ["Transition speed", "Wide stretching to create channels", "Patience in possession"],
        equipment: ["2 Goals", "Balls", "Bibs"]
      }
    ]
  },
  {
    id: "set-pieces-corners",
    title: "Set Pieces: Corner Routines",
    description: "Master near-post flicks, back-post overloads, and defensive second-ball coverage.",
    category: "Set Pieces",
    goalText: "Perfect corner-kick attacking routines and establish rigid zonal marker coverages.",
    durationMins: 75,
    playerCount: 16,
    drills: [
      {
        name: "Corner Delivery & Unopposed Rehearsal",
        duration: 20,
        description: "Practice designated runs (near-post decoy, center-box hammer, far-post crash) with high-quality deliveries.",
        coachingCues: ["Precision of delivery into the corridor of uncertainty", "Synchronized run timing", "Blocks on key defenders"],
        equipment: ["Corner Flags", "12 Balls", "Coaching board"]
      },
      {
        name: "Opposed Corner Defense (8v8)",
        duration: 30,
        description: "Live corner-kick repetitions. Defending team sets zonal and man-marking structure; attacking team tries 3 rehearsed routines.",
        coachingCues: ["Aggressive attack of the high ball", "First contact priority", "Clearances into wide outlet areas"],
        equipment: ["Full-size Goal", "15 Balls", "Bibs"]
      },
      {
        name: "Set Piece Conditioned Match",
        duration: 25,
        description: "8v8 scrimmage where any foul or ball out of play in the attacking half triggers an instant corner or free-kick.",
        coachingCues: ["Quick organization", "Maintain focus during set piece delay", "Exploit second-ball rebounds"],
        equipment: ["2 Goals", "Balls", "Bibs"]
      }
    ]
  },
  {
    id: "defensive-low-block",
    title: "Defending: Deep Low Block",
    description: "Train defensive shift timing, compact vertical lines, and counter-attack triggers.",
    category: "Defending",
    goalText: "Train sliding defensive units, mid-to-low block compactness, and rapid transition triggers.",
    durationMins: 90,
    playerCount: 18,
    drills: [
      {
        name: "Back 4 + 2 DM Sliding Drills",
        duration: 20,
        description: "Lightly opposed. Move defensive lines collectively side-by-side relative to the ball position across three distinct zones.",
        coachingCues: ["Maintain 8-10m distance between players", "Drop off when no pressure on the ball", "Fullback-CB coverage handover"],
        equipment: ["12 Cones", "Balls"]
      },
      {
        name: "Attack vs Compact Block (10v8)",
        duration: 45,
        description: "Attackers try to break down a compact low block in the final third. If the block wins the ball, they have 10s to hit mini outlet goals.",
        coachingCues: ["Force play out wide", "Squeeze spaces between lines", "Fast forward outlet passes on turnover"],
        equipment: ["1 Full Goal", "2 Mini Goals", "15 Cones", "Balls"]
      },
      {
        name: "Low Block Match (9v9)",
        duration: 25,
        description: "Match play where one team is designated to defend in their own half. Focus is on discipline, patience, and counter-attacks.",
        coachingCues: ["Do not break defensive ranks", "Aggressive pressing in the active zone", "Breakout speed"],
        equipment: ["2 Goals", "Balls", "Bibs"]
      }
    ]
  },
  {
    id: "counter-attack-transition",
    title: "Attacking: Fast Transitions",
    description: "Develop vertical breakout speed, progressive forward passing, and overlapping runs.",
    category: "Attacking",
    goalText: "Master progressive vertical passes, third-man runs, and clinical 3v2 counter-attacks.",
    durationMins: 60,
    playerCount: 12,
    drills: [
      {
        name: "Continuous Counter Waves (3v2 to 4v3)",
        duration: 25,
        description: "3 attackers run at 2 defenders. On shot or turnover, those defenders instantly transition into a 4v3 counter the other way.",
        coachingCues: ["Drive at defenders with speed", "Overlap/underlap decoy runs", "Clinical finishing in under 8 seconds"],
        equipment: ["2 Goals", "Balls", "Bibs"]
      },
      {
        name: "Midfield Turn & Progressive Pass",
        duration: 20,
        description: "Midfielders receive a ball under pressure, turn in a tight space, and release a dynamic winger making an diagonal run.",
        coachingCues: ["Check shoulder before receiving", "Weight and curve of forward pass", "Speed of winger's run-in"],
        equipment: ["6 Cones", "10 Balls", "Coaching mannequin"]
      },
      {
        name: "Transition Scrimmage (6v6)",
        duration: 15,
        description: "6v6 scrimmage. Goals scored within 5 seconds of regaining possession in the midfield count double.",
        coachingCues: ["Immediate vertical look", "Speed of forward support", "Overload the penalty area"],
        equipment: ["2 Goals", "Balls", "Bibs"]
      }
    ]
  }
];

interface TeamWorkspaceProps {
  players: Player[];
  matches: FootballMatch[];
  trainingSessions: TrainingSession[];
  onAddPlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onUpdatePlayer?: (player: Player) => void;
  onAddMatch: (match: FootballMatch) => void;
  onAddTrainingSession: (session: TrainingSession) => void;
}

interface ScheduledSession {
  id: string;
  title: string;
  goalText: string;
  durationMins: number;
  playerCount: number;
  drills: SessionDrill[];
  date: string; // YYYY-MM-DD
  category: "Possession" | "Set Pieces" | "Attacking" | "Defending" | "Conditioning";
}

export default function TeamWorkspace({
  players,
  matches,
  trainingSessions,
  onAddPlayer,
  onDeletePlayer,
  onUpdatePlayer,
  onAddMatch,
  onAddTrainingSession
}: TeamWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"players" | "matches" | "training" | "calendar">("players");

  // Calendar states
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(() => {
    const cached = localStorage.getItem("tactiq_scheduled_sessions");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error loading scheduled sessions", e);
      }
    }
    // Seed scheduled training sessions for July 2026 to make the view instantly interactive and informative
    return [
      {
        id: "sched-1",
        title: "Possession: Triangle Circulation",
        goalText: "Develop rapid ball circulation, triangle pass lanes, and immediate transition recovery.",
        durationMins: 60,
        playerCount: 14,
        date: "2026-07-08",
        drills: PRE_BUILT_TEMPLATES[0].drills,
        category: "Possession"
      },
      {
        id: "sched-2",
        title: "Defending: Deep Low Block",
        goalText: "Train sliding defensive units, mid-to-low block compactness, and rapid transition triggers.",
        durationMins: 90,
        playerCount: 18,
        date: "2026-07-15",
        drills: PRE_BUILT_TEMPLATES[2].drills,
        category: "Defending"
      }
    ];
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 6, 1)); // Month 6 = July 2026
  const [selectedScheduledSession, setSelectedScheduledSession] = useState<ScheduledSession | null>(null);
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarCategory, setSidebarCategory] = useState<string>("All");
  const [selectedLibraryTab, setSelectedLibraryTab] = useState<"templates" | "saved">("templates");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth(); // 0-11
  
  // First day of current month (0: Sunday, 1: Monday, ...)
  const firstDayIndex = new Date(year, monthIndex, 1).getDay(); 
  
  // Days in current month
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  
  // Days in previous month (for leading padding)
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();

  // Leading days from previous month
  const leadingDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonthVal = monthIndex === 0 ? 12 : monthIndex;
    const prevYearVal = monthIndex === 0 ? year - 1 : year;
    leadingDays.push({
      day: d,
      monthType: "prev",
      dateKey: `${prevYearVal}-${String(prevMonthVal).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    });
  }
  
  // Days of current month
  const currentDays = [];
  for (let i = 1; i <= totalDays; i++) {
    currentDays.push({
      day: i,
      monthType: "current",
      dateKey: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    });
  }
  
  // Trailing days of next month (to pad up to a multiple of 7)
  const totalCells = leadingDays.length + currentDays.length;
  const trailingCellsNeeded = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = [];
  for (let i = 1; i <= trailingCellsNeeded; i++) {
    const nextMonthVal = monthIndex === 11 ? 1 : monthIndex + 2;
    const nextYearVal = monthIndex === 11 ? year + 1 : year;
    trailingDays.push({
      day: i,
      monthType: "next",
      dateKey: `${nextYearVal}-${String(nextMonthVal).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    });
  }
  
  const allCalendarDays = [...leadingDays, ...currentDays, ...trailingDays];

  // Add Player State
  const [pName, setPName] = useState("");
  const [pNumber, setPNumber] = useState(10);
  const [pRole, setPRole] = useState<"GK" | "DEF" | "MID" | "ATT">("MID");
  const [pPos, setPPos] = useState("CM");

  // Player Form Attributes State
  const [pSpeed, setPSpeed] = useState(80);
  const [pPassing, setPPassing] = useState(80);
  const [pPositioning, setPPositioning] = useState(80);
  const [pDefending, setPDefending] = useState(65);
  const [pShooting, setPShooting] = useState(70);
  const [pStamina, setPStamina] = useState(85);

  // Selected Player Tracking
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Compare Players States
  const [workspaceView, setWorkspaceView] = useState<"individual" | "comparison">("individual");
  const [comparePlayerAId, setComparePlayerAId] = useState<string | null>(null);
  const [comparePlayerBId, setComparePlayerBId] = useState<string | null>(null);

  // Add Match State
  const [opponent, setOpponent] = useState("");
  const [scoreH, setScoreH] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [formUsed, setFormUsed] = useState("4-3-3");
  const [notes, setNotes] = useState("");

  // AI Training Generator State
  const [sessionGoal, setSessionGoal] = useState("Improve counter-pressing reaction times in transition.");
  const [durationMins, setDurationMins] = useState(60);
  const [playerCount, setPlayerCount] = useState(16);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  const radarData = useMemo(() => {
    if (!activePlayer) return [];
    const attrs = getPlayerAttributes(activePlayer);
    return [
      { subject: "Speed", value: attrs.speed },
      { subject: "Passing", value: attrs.passing },
      { subject: "Positioning", value: attrs.positioning },
      { subject: "Defending", value: attrs.defending },
      { subject: "Shooting", value: attrs.shooting },
      { subject: "Stamina", value: attrs.stamina },
    ];
  }, [activePlayer]);

  const playerA = useMemo(() => {
    return players.find(p => p.id === comparePlayerAId) || players[0];
  }, [players, comparePlayerAId]);

  const playerB = useMemo(() => {
    const foundB = players.find(p => p.id === comparePlayerBId);
    if (foundB && foundB.id !== playerA?.id) return foundB;
    return players.find(p => p.id !== playerA?.id) || players[0];
  }, [players, comparePlayerBId, playerA]);

  const compareRadarData = useMemo(() => {
    if (!playerA || !playerB) return [];
    const attrsA = getPlayerAttributes(playerA);
    const attrsB = getPlayerAttributes(playerB);
    return [
      { subject: "Speed", playerAValue: attrsA.speed, playerBValue: attrsB.speed },
      { subject: "Passing", playerAValue: attrsA.passing, playerBValue: attrsB.passing },
      { subject: "Positioning", playerAValue: attrsA.positioning, playerBValue: attrsB.positioning },
      { subject: "Defending", playerAValue: attrsA.defending, playerBValue: attrsB.defending },
      { subject: "Shooting", playerAValue: attrsA.shooting, playerBValue: attrsB.shooting },
      { subject: "Stamina", playerAValue: attrsA.stamina, playerBValue: attrsB.stamina },
    ];
  }, [playerA, playerB]);

  // Dynamic automatic stats updates on form role select
  const handleRoleChange = (role: "GK" | "DEF" | "MID" | "ATT") => {
    setPRole(role);
    if (role === "ATT") {
      setPSpeed(88);
      setPPassing(78);
      setPPositioning(85);
      setPDefending(35);
      setPShooting(86);
      setPStamina(80);
      setPPos("ST");
    } else if (role === "MID") {
      setPSpeed(78);
      setPPassing(88);
      setPPositioning(84);
      setPDefending(65);
      setPShooting(75);
      setPStamina(88);
      setPPos("CM");
    } else if (role === "DEF") {
      setPSpeed(75);
      setPPassing(72);
      setPPositioning(82);
      setPDefending(88);
      setPShooting(45);
      setPStamina(82);
      setPPos("CB");
    } else if (role === "GK") {
      setPSpeed(52);
      setPPassing(70);
      setPPositioning(90);
      setPDefending(85);
      setPShooting(20);
      setPStamina(68);
      setPPos("GK");
    }
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    onAddPlayer({
      id: "player-" + Date.now(),
      name: pName,
      number: pNumber,
      role: pRole,
      positionName: pPos,
      x: 50,
      y: 50,
      speed: pSpeed,
      passing: pPassing,
      positioning: pPositioning,
      defending: pDefending,
      shooting: pShooting,
      stamina: pStamina
    });
    setPName("");
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) return;
    onAddMatch({
      id: "match-" + Date.now(),
      opponentName: opponent,
      date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
      scoreHome: scoreH,
      scoreAway: scoreA,
      formationUsed: formUsed,
      coachNotes: notes
    });
    setOpponent("");
    setNotes("");
    alert("Match log successfully saved! Refresh Home to recalculate Match Brain.");
  };

  const handleImportTemplate = (tmpl: TrainingTemplate) => {
    setSessionGoal(tmpl.goalText);
    setDurationMins(tmpl.durationMins);
    setPlayerCount(tmpl.playerCount);

    const importedSession: TrainingSession = {
      id: "session-tmpl-" + tmpl.id + "-" + Date.now(),
      goalText: tmpl.goalText,
      durationMins: tmpl.durationMins,
      playerCount: tmpl.playerCount,
      drills: tmpl.drills,
      createdAt: new Date().toISOString()
    };
    onAddTrainingSession(importedSession);
    setActiveSession(importedSession);
    alert(`Successfully imported "${tmpl.title}" template!\n\nThe template's drills have been loaded below. You can still tweak details or regenerate with AI if desired.`);
  };

  // Save scheduled list helper
  const saveScheduledSessions = (sessionsList: ScheduledSession[]) => {
    setScheduledSessions(sessionsList);
    localStorage.setItem("tactiq_scheduled_sessions", JSON.stringify(sessionsList));
  };

  // Schedule a session (creates a ScheduledSession record)
  const handleScheduleSession = (sessionData: any, dateStr: string, type: "template" | "saved") => {
    const isTemplate = type === "template";
    const newScheduled: ScheduledSession = {
      id: "sched-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      title: isTemplate ? sessionData.title : (sessionData.goalText ? `AI: ${sessionData.goalText}` : "AI Custom Session"),
      goalText: sessionData.goalText || "",
      durationMins: sessionData.durationMins || sessionData.duration || 60,
      playerCount: sessionData.playerCount || 16,
      drills: sessionData.drills || [],
      date: dateStr,
      category: sessionData.category || "Possession"
    };
    const updated = [...scheduledSessions, newScheduled];
    saveScheduledSessions(updated);
  };

  // Move scheduled session to a different date (rescheduling)
  const handleMoveScheduledSession = (scheduledId: string, newDate: string) => {
    const updated = scheduledSessions.map(item => {
      if (item.id === scheduledId) {
        return { ...item, date: newDate };
      }
      return item;
    });
    saveScheduledSessions(updated);
  };

  // Unschedule / remove from calendar
  const handleUnscheduleSession = (scheduledId: string) => {
    const updated = scheduledSessions.filter(item => item.id !== scheduledId);
    saveScheduledSessions(updated);
  };

  const handleGenerateTraining = async () => {
    setGeneratingTraining(true);
    try {
      const res = await fetch("/api/gemini/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalText: sessionGoal,
          durationMins,
          playerCount
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newSession: TrainingSession = {
          id: "session-" + Date.now(),
          goalText: sessionGoal,
          durationMins,
          playerCount,
          drills: data.drills,
          createdAt: new Date().toISOString()
        };
        onAddTrainingSession(newSession);
        setActiveSession(newSession);
      } else {
        throw new Error("Generation failed");
      }
    } catch (err) {
      // Fallback
      const fallbackDrills: SessionDrill[] = [
        {
          name: "Transition Rondo 4v2",
          duration: 15,
          description: "Rapid recovery passing inside a 10x10m square focusing on fast pass and counter pressing transition on turnover.",
          coachingCues: ["Immediate pressure upon loss", "Speed of release", "Use hips to disguise pass"],
          equipment: ["4 cones", "Bibs", "Balls"]
        },
        {
          name: "Tactical Defense Channel Shifting",
          duration: 30,
          description: "Full width grid practice. Shift backline left-to-right as ball moves to close wide spaces and prevent channel overload.",
          coachingCues: ["Keep compact horizontal distance", "Fullback commits while CB covers behind", "GK communicates active ball line"],
          equipment: ["10 cones", "8 balls", "Coaching boards"]
        },
        {
          name: "Scrimmage with Overload rules",
          duration: 15,
          description: "8v8 conditioned scrimmage. Goals scored within 5 seconds of transitions count triple.",
          coachingCues: ["Transition speed", "Wide stretch play", "Dynamic overlaps"],
          equipment: ["Goals", "Balls", "Bibs"]
        }
      ];
      const newSession: TrainingSession = {
        id: "session-" + Date.now(),
        goalText: sessionGoal,
        durationMins,
        playerCount,
        drills: fallbackDrills,
        createdAt: new Date().toISOString()
      };
      onAddTrainingSession(newSession);
      setActiveSession(newSession);
    } finally {
      setGeneratingTraining(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto text-gray-100">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/40">
            Manager Workspace
          </span>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mt-3">
            Team Hub
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="tab-players"
            onClick={() => setActiveSubTab("players")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              activeSubTab === "players"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Squad Roster</span>
          </button>
          <button
            id="tab-matches"
            onClick={() => setActiveSubTab("matches")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              activeSubTab === "matches"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Match Logs</span>
          </button>
          <button
            id="tab-training"
            onClick={() => setActiveSubTab("training")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              activeSubTab === "training"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Session Builder</span>
          </button>
          <button
            id="tab-calendar"
            onClick={() => setActiveSubTab("calendar")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              activeSubTab === "calendar"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Training Calendar</span>
          </button>
        </div>
      </div>

      {/* SUB TAB: SQUAD ROSTER */}
      {activeSubTab === "players" && (
        <div className="space-y-4">
          {/* Workspace view switcher */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <button
              id="view-switcher-individual"
              onClick={() => setWorkspaceView("individual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                workspaceView === "individual"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-400 font-bold"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Individual Profiles & Tuning
            </button>
            <button
              id="view-switcher-comparison"
              onClick={() => setWorkspaceView("comparison")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                workspaceView === "comparison"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-400 font-bold"
                  : "bg-transparent border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Side-by-Side Comparison Radar
            </button>
          </div>

          {workspaceView === "individual" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Column 1: Add Squad Player Form */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg h-fit space-y-4">
            <h3 className="font-bold text-white text-base">Add Player Profile</h3>
            <form onSubmit={handleCreatePlayer} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Full Name</label>
                <input
                  id="input-player-name"
                  type="text"
                  placeholder="e.g. Jack Grealish"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Jersey #</label>
                  <input
                    id="input-player-number"
                    type="number"
                    value={pNumber}
                    onChange={(e) => setPNumber(parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Line Role</label>
                  <select
                    id="select-player-role"
                    value={pRole}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="ATT">Attacker</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Specific Position</label>
                <input
                  id="input-player-pos"
                  type="text"
                  placeholder="e.g. CM, LW, CB"
                  value={pPos}
                  onChange={(e) => setPPos(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Collapsible/neat section for Initial Attributes */}
              <div className="space-y-2 border-t border-gray-850 pt-2.5">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block tracking-wider">Initial Attributes</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Speed ({pSpeed})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pSpeed}
                      onChange={(e) => setPSpeed(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Passing ({pPassing})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pPassing}
                      onChange={(e) => setPPassing(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Positioning ({pPositioning})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pPositioning}
                      onChange={(e) => setPPositioning(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Defending ({pDefending})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pDefending}
                      onChange={(e) => setPDefending(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Shooting ({pShooting})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pShooting}
                      onChange={(e) => setPShooting(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-mono block">Stamina ({pStamina})</label>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={pStamina}
                      onChange={(e) => setPStamina(parseInt(e.target.value) || 50)}
                      className="w-full accent-emerald-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                id="btn-add-player-submit"
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs transition cursor-pointer"
              >
                Save Player Profile
              </button>
            </form>
          </div>

          {/* Column 2: Roster Listing Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center bg-gray-900/30 p-4 border border-gray-850 rounded-lg">
              <span className="text-xs font-mono text-gray-400">REGISTERED OUTFIELD ATHLETES</span>
              <span className="text-xs font-bold text-white">{players.length} Total</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {players.map((p) => {
                const isSelected = activePlayer?.id === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`border rounded-lg p-3 flex items-center justify-between shadow transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20" 
                        : "bg-gray-900 border-gray-800/80 hover:border-gray-700 hover:bg-gray-850/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs border ${
                        isSelected 
                          ? "bg-emerald-950 border-emerald-500 text-emerald-400" 
                          : "bg-gray-950 border-gray-800 text-gray-400"
                      }`}>
                        {p.number}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                          {p.role} — {p.positionName}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent selecting
                        onDeletePlayer(p.id);
                        if (selectedPlayerId === p.id) {
                          setSelectedPlayerId(null);
                        }
                      }}
                      className="p-1.5 hover:bg-red-950 border border-transparent hover:border-red-900/40 text-gray-500 hover:text-red-400 rounded transition cursor-pointer"
                      title="Remove player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {players.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-gray-850 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p>No athletes in roster. Add profiles to visualize charts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Active Player Attribute Radar Analysis */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg h-fit space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Attribute Radar</h3>
                </div>
                {activePlayer && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded">
                    Role: {activePlayer.role}
                  </span>
                )}
              </div>

              {activePlayer ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border border-emerald-500/30 flex flex-col items-center justify-center shadow">
                      <span className="text-xs text-emerald-400 font-mono font-bold">#{activePlayer.number}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{activePlayer.positionName}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">{activePlayer.name}</h4>
                      <p className="text-xs text-gray-400 font-mono">Squad Outfield Profile</p>
                    </div>
                  </div>

                  {/* Recharts Radar Chart */}
                  <div className="h-56 w-full flex items-center justify-center bg-gray-950/40 border border-gray-850 rounded-lg p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#1f2937" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: "500" }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: "#4b5563", fontSize: 8 }}
                          axisLine={false}
                        />
                        <Radar
                          name={activePlayer.name}
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Attribute Bars & Fine-Tuning */}
                  <div className="space-y-3.5 pt-1">
                    <h5 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-gray-500" />
                      <span>Tune Attributes</span>
                    </h5>

                    {(() => {
                      const attrs = getPlayerAttributes(activePlayer);
                      const attributesList = [
                        { key: "speed", label: "Speed ⚡", value: attrs.speed, color: "bg-amber-500" },
                        { key: "passing", label: "Passing 🎯", value: attrs.passing, color: "bg-emerald-500" },
                        { key: "positioning", label: "Positioning 📍", value: attrs.positioning, color: "bg-sky-500" },
                        { key: "defending", label: "Defending 🛡️", value: attrs.defending, color: "bg-red-500" },
                        { key: "shooting", label: "Shooting ⚽", value: attrs.shooting, color: "bg-rose-500" },
                        { key: "stamina", label: "Stamina 🔋", value: attrs.stamina, color: "bg-teal-500" },
                      ];

                      return (
                        <div className="space-y-3">
                          {attributesList.map((attr) => (
                            <div key={attr.key} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-gray-300">{attr.label}</span>
                                <span className="font-mono font-bold text-white bg-gray-950 px-1.5 py-0.5 rounded text-[10px] border border-gray-850">
                                  {attr.value}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="99"
                                value={attr.value}
                                onChange={(e) => {
                                  if (onUpdatePlayer) {
                                    onUpdatePlayer({
                                      ...activePlayer,
                                      [attr.key]: parseInt(e.target.value) || 50
                                    });
                                  }
                                }}
                                disabled={!onUpdatePlayer}
                                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-xs flex flex-col items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600 mb-2" />
                  <p>Select a player from the roster to analyze their attribute radar chart and fine-tune stats.</p>
                </div>
              )}
            </div>
          </div>
        </div>
          ) : (
            <div className="bg-gray-900/20 border border-gray-800 rounded-xl p-6 shadow-xl space-y-6 animate-fade-in">
              {players.length < 2 ? (
                <div className="text-center py-16 text-gray-500 text-xs flex flex-col items-center justify-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <h3 className="font-bold text-white text-base">Insufficient Players for Comparison</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    You need at least 2 players registered in your squad roster to view their side-by-side attributes comparison. Go to "Individual Profiles" to add more players.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950/40 p-4 border border-gray-850 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs text-emerald-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Player A (Primary)</span>
                      </label>
                      <select
                        id="compare-select-a"
                        value={comparePlayerAId || ""}
                        onChange={(e) => setComparePlayerAId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {players.map(p => (
                          <option key={p.id} value={p.id}>#{p.number} - {p.name} ({p.role})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-amber-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        <span>Player B (Comparison)</span>
                      </label>
                      <select
                        id="compare-select-b"
                        value={comparePlayerBId || ""}
                        onChange={(e) => setComparePlayerBId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {players.map(p => (
                          <option key={p.id} value={p.id} disabled={p.id === (playerA?.id)}>#{p.number} - {p.name} ({p.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Main side by side comparisons */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column Left: Radar Chart Comparison */}
                    <div className="lg:col-span-5 bg-gray-950/30 border border-gray-850 rounded-xl p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase font-mono tracking-wider mb-1 flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <span>Overlaid Attribute Radar</span>
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          Direct spatial mapping of both outfield profiles.
                        </p>
                      </div>

                      <div className="h-64 w-full flex items-center justify-center p-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={compareRadarData}>
                            <PolarGrid stroke="#1f2937" />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: "500" }} 
                            />
                            <PolarRadiusAxis 
                              angle={30} 
                              domain={[0, 100]} 
                              tick={{ fill: "#4b5563", fontSize: 8 }}
                              axisLine={false}
                            />
                            <Radar
                              name={playerA?.name}
                              dataKey="playerAValue"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                            <Radar
                              name={playerB?.name}
                              dataKey="playerBValue"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: "#030712", 
                                borderColor: "#1f2937", 
                                borderRadius: "8px", 
                                fontSize: "11px",
                                color: "#fff"
                              }} 
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Simple legend */}
                      <div className="grid grid-cols-2 gap-3 bg-gray-950/40 p-3 rounded-lg border border-gray-850 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 inline-block"></span>
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{playerA?.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-mono">{playerA?.positionName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400 inline-block"></span>
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{playerB?.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-mono">{playerB?.positionName}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column Right: Visual Side-by-Side Stat Cards */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-gray-950/20 border border-gray-850 rounded-xl p-5 space-y-4">
                        <h4 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span>Performance Matrix Breakdown</span>
                        </h4>

                        {(() => {
                          const attrsA = getPlayerAttributes(playerA);
                          const attrsB = getPlayerAttributes(playerB);
                          const metrics = [
                            { key: "speed", label: "Speed ⚡", valA: attrsA.speed, valB: attrsB.speed },
                            { key: "passing", label: "Passing 🎯", valA: attrsA.passing, valB: attrsB.passing },
                            { key: "positioning", label: "Positioning 📍", valA: attrsA.positioning, valB: attrsB.positioning },
                            { key: "defending", label: "Defending 🛡️", valA: attrsA.defending, valB: attrsB.defending },
                            { key: "shooting", label: "Shooting ⚽", valA: attrsA.shooting, valB: attrsB.shooting },
                            { key: "stamina", label: "Stamina 🔋", valA: attrsA.stamina, valB: attrsB.stamina },
                          ];

                          return (
                            <div className="space-y-3">
                              {/* Headers */}
                              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono uppercase font-bold text-gray-500 px-2 pb-1 border-b border-gray-850">
                                <span className="col-span-4">Attribute Category</span>
                                <span className="col-span-3 text-right text-emerald-400">{playerA?.name.split(" ")[0]}</span>
                                <span className="col-span-2 text-center">Variance</span>
                                <span className="col-span-3 text-left text-amber-400">{playerB?.name.split(" ")[0]}</span>
                              </div>

                              {metrics.map((m) => {
                                const diff = m.valA - m.valB;
                                const winner = diff > 0 ? "A" : diff < 0 ? "B" : "Tie";

                                return (
                                  <div key={m.key} className="grid grid-cols-12 gap-2 items-center bg-gray-900/40 border border-gray-850 hover:border-gray-800 rounded-lg p-3 transition">
                                    {/* Label */}
                                    <span className="col-span-4 text-xs font-bold text-gray-300">{m.label}</span>

                                    {/* Player A Stats */}
                                    <div className="col-span-3 flex items-center justify-end gap-2">
                                      <span className={`text-xs font-mono font-bold ${winner === "A" ? "text-emerald-400" : "text-gray-400"}`}>
                                        {m.valA}
                                      </span>
                                      <div className="w-12 bg-gray-950 h-2 rounded-full overflow-hidden hidden sm:block">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${winner === "A" ? "bg-emerald-500" : "bg-gray-700"}`}
                                          style={{ width: `${m.valA}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Variance indicator */}
                                    <div className="col-span-2 text-center">
                                      {diff > 0 ? (
                                        <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/40 font-mono">
                                          +{diff}
                                        </span>
                                      ) : diff < 0 ? (
                                        <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/40 font-mono">
                                          +{Math.abs(diff)}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono font-semibold bg-gray-950 text-gray-500 px-1.5 py-0.5 rounded border border-gray-850">
                                          Tie
                                        </span>
                                      )}
                                    </div>

                                    {/* Player B Stats */}
                                    <div className="col-span-3 flex items-center justify-start gap-2">
                                      <div className="w-12 bg-gray-950 h-2 rounded-full overflow-hidden hidden sm:block">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${winner === "B" ? "bg-amber-500" : "bg-gray-700"}`}
                                          style={{ width: `${m.valB}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-mono font-bold ${winner === "B" ? "text-amber-400" : "text-gray-400"}`}>
                                        {m.valB}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Comparative Coaching Summary insight */}
                      <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4 text-xs text-gray-300 space-y-1.5">
                        <span className="font-bold text-emerald-400 uppercase tracking-wide font-mono text-[10px] block">
                          Tactical Intelligence Insight
                        </span>
                        <p className="leading-relaxed">
                          {(() => {
                            if (!playerA || !playerB) return "";
                            const attrsA = getPlayerAttributes(playerA);
                            const attrsB = getPlayerAttributes(playerB);
                            
                            const scoreA = attrsA.speed + attrsA.passing + attrsA.positioning + attrsA.defending + attrsA.shooting + attrsA.stamina;
                            const scoreB = attrsB.speed + attrsB.passing + attrsB.positioning + attrsB.defending + attrsB.shooting + attrsB.stamina;
                            
                            let strongestA = "speed";
                            let maxValA = attrsA.speed;
                            if (attrsA.passing > maxValA) { strongestA = "passing"; maxValA = attrsA.passing; }
                            if (attrsA.positioning > maxValA) { strongestA = "positioning"; maxValA = attrsA.positioning; }
                            if (attrsA.defending > maxValA) { strongestA = "defending"; maxValA = attrsA.defending; }
                            if (attrsA.shooting > maxValA) { strongestA = "shooting"; maxValA = attrsA.shooting; }
                            if (attrsA.stamina > maxValA) { strongestA = "stamina"; }

                            let strongestB = "speed";
                            let maxValB = attrsB.speed;
                            if (attrsB.passing > maxValB) { strongestB = "passing"; maxValB = attrsB.passing; }
                            if (attrsB.positioning > maxValB) { strongestB = "positioning"; maxValB = attrsB.positioning; }
                            if (attrsB.defending > maxValB) { strongestB = "defending"; maxValB = attrsB.defending; }
                            if (attrsB.shooting > maxValB) { strongestB = "shooting"; maxValB = attrsB.shooting; }
                            if (attrsB.stamina > maxValB) { strongestB = "stamina"; }

                            const higherOverall = scoreA > scoreB ? playerA.name : scoreB > scoreA ? playerB.name : "both players";
                            
                            return (
                              <span>
                                <strong>{playerA.name}</strong> excels primarily in <strong>{strongestA}</strong>, whereas <strong>{playerB.name}</strong> shines brightest in <strong>{strongestB}</strong>. 
                                {scoreA !== scoreB ? (
                                  <span> Combined aggregate profiles show <strong>{higherOverall}</strong> as the higher-rated general option for high-intensity setups.</span>
                                ) : (
                                  <span> Both players have perfectly symmetrical aggregate scorelines, making selection highly dependent on specific opponent vulnerabilities.</span>
                                )}
                              </span>
                            );
                          })()}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB: MATCH LOGS */}
      {activeSubTab === "matches" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Match Form */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg h-fit space-y-4">
            <h3 className="font-bold text-white text-base">Log Weekend Match</h3>
            <form onSubmit={handleCreateMatch} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Opponent Name</label>
                <input
                  id="input-match-opponent"
                  type="text"
                  placeholder="e.g. Riverside FC"
                  required
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Our Goals</label>
                  <input
                    id="input-match-score-home"
                    type="number"
                    value={scoreH}
                    onChange={(e) => setScoreH(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Opponent Goals</label>
                  <input
                    id="input-match-score-away"
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Formation Used</label>
                <input
                  id="input-match-formation"
                  type="text"
                  placeholder="e.g. 4-3-3"
                  value={formUsed}
                  onChange={(e) => setFormUsed(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Tactical Match Notes</label>
                <textarea
                  id="textarea-match-notes"
                  placeholder="Conceded twice from counter-attacks on the right flank after our fullback committed forward..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="btn-match-submit"
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs transition cursor-pointer"
              >
                Log Weekend Result
              </button>
            </form>
          </div>

          {/* Matches List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base">Match History Logbook</h3>
            
            {matches.length === 0 ? (
              <div className="bg-gray-900/30 p-8 border border-dashed border-gray-800 rounded-lg text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No weekend matches logged yet. Complete the log form to activate Match Brain.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <div 
                    key={m.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-850 pb-2">
                      <span>Fixture Date: {m.date}</span>
                      <span>Formation: <strong className="font-mono text-gray-300">{m.formationUsed}</strong></span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm text-gray-300">vs {m.opponentName}</span>
                      </div>
                      <div className="px-3 py-1 bg-gray-950 text-white text-base font-bold rounded font-mono border border-gray-850">
                        {m.scoreHome} - {m.scoreAway}
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 bg-gray-950/60 p-3 rounded leading-relaxed border-l-2 border-indigo-500">
                      <strong>Coach notes:</strong> {m.coachNotes || "No notes logged."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: AI TRAINING SESSION BUILDER */}
      {activeSubTab === "training" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Specs & Templates */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Builder Controls */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg h-fit space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
                <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Session Specs</h3>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Session Goal / Theme</label>
                  <textarea
                    id="input-session-goal"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Duration (Mins)</label>
                    <input
                      id="input-session-duration"
                      type="number"
                      min={1}
                      value={durationMins || ""}
                      onChange={(e) => setDurationMins(e.target.value === "" ? "" as any : parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-semibold font-mono uppercase">Squad Size</label>
                    <input
                      id="input-session-players"
                      type="number"
                      min={1}
                      value={playerCount || ""}
                      onChange={(e) => setPlayerCount(e.target.value === "" ? "" as any : parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  id="btn-generate-training"
                  onClick={handleGenerateTraining}
                  disabled={generatingTraining || !durationMins || !playerCount || durationMins < 1 || playerCount < 1}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Brain className="w-4 h-4" />
                  <span>{generatingTraining ? "Compiling Drills..." : "Build Session with AI"}</span>
                </button>
              </div>
            </div>

            {/* Pre-Built Templates Library */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg h-fit space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Template Library</h3>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Import a premium, pre-configured UEFA-standard syllabus directly into the builder.
              </p>

              <div className="space-y-3">
                {PRE_BUILT_TEMPLATES.map((tmpl) => (
                  <div 
                    key={tmpl.id}
                    className="bg-gray-950 border border-gray-850 hover:border-indigo-500/50 rounded-lg p-3.5 transition group flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tmpl.durationMins} mins
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-200 mt-2 text-xs group-hover:text-white transition">
                      {tmpl.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                      {tmpl.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-900">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {tmpl.playerCount} Players • {tmpl.drills.length} Drills
                      </span>
                      <button
                        id={`btn-import-template-${tmpl.id}`}
                        onClick={() => handleImportTemplate(tmpl)}
                        className="px-2.5 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition cursor-pointer"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Builder Output */}
          <div className="lg:col-span-2 space-y-5">
            {activeSession ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {activeSession.id.startsWith("session-tmpl-") ? "UEFA Template Syllabus" : "AI Generated Syllabus"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Goal: <span className="font-semibold text-emerald-400">"{activeSession.goalText}"</span></p>
                  </div>
                  <button 
                    onClick={() => alert("Syllabus shared with WhatsApp squad group!")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded hover:text-white transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Share</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {activeSession.drills.map((dr, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-900 border border-gray-850 rounded-xl p-5 shadow space-y-3.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-900/30 px-2 py-0.5 rounded font-bold">
                          DRILL 0{idx + 1}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dr.duration} mins</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base">{dr.name}</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                          {dr.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-850 pt-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-gray-400 uppercase tracking-wide block">Coaching Cues:</span>
                          <ul className="list-disc list-inside text-emerald-300/90 space-y-1">
                            {dr.coachingCues.map((cue, cidx) => (
                              <li key={cidx}>{cue}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-gray-400 uppercase tracking-wide block">Required Equipment:</span>
                          <p className="text-gray-400 font-mono">
                            {dr.equipment.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/30 p-12 border border-dashed border-gray-850 rounded-xl text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <Brain className="w-12 h-12 text-gray-600 mb-3" />
                <h4 className="font-bold text-white mb-1">Interactive Tactical Drills Builder</h4>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  Enter your practice objective (e.g. wing overloads, defensive compactness) on the left side, or load one of our UEFA prebuilt templates to assemble a complete curriculum list.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: MONTHLY TRAINING CALENDAR */}
      {activeSubTab === "calendar" && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in" id="team-calendar-workspace">
          
          {/* Main Calendar View: 3/4 Width on Desktop */}
          <div className="xl:col-span-3 space-y-4" id="calendar-grid-container">
            
            {/* Calendar Controls & Month Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/40 border border-gray-800 p-4 rounded-xl gap-4" id="calendar-header">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
                    {monthNames[monthIndex]} {year}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Drag UEFA templates or custom plans here to schedule squad sessions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" id="calendar-month-navigation">
                <button
                  id="btn-calendar-prev-month"
                  onClick={handlePrevMonth}
                  className="p-1.5 bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-calendar-today"
                  onClick={() => setCurrentMonth(new Date(2026, 6, 1))}
                  className="px-3 py-1.5 text-xs bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg font-mono transition cursor-pointer"
                >
                  July 2026 (Today)
                </button>
                <button
                  id="btn-calendar-next-month"
                  onClick={handleNextMonth}
                  className="p-1.5 bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid Box */}
            <div className="bg-gray-900/20 border border-gray-850 rounded-xl overflow-hidden shadow-xl" id="calendar-days-grid">
              
              {/* Days of Week Headers */}
              <div className="grid grid-cols-7 border-b border-gray-850 bg-gray-950/50 text-center py-2.5">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                  <span key={wd} className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Monthly Grid cells */}
              <div className="grid grid-cols-7 bg-gray-950/20">
                {allCalendarDays.map((dayItem, cellIdx) => {
                  const daySessions = scheduledSessions.filter(s => s.date === dayItem.dateKey);
                  const isCurrentMonth = dayItem.monthType === "current";
                  const isToday = dayItem.dateKey === "2026-07-01"; // current local date simulation
                  const isDragOver = draggedOverDate === dayItem.dateKey;

                  return (
                    <div
                      key={dayItem.dateKey}
                      id={`calendar-day-cell-${dayItem.dateKey}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDraggedOverDate(dayItem.dateKey);
                      }}
                      onDragLeave={() => {
                        setDraggedOverDate(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDraggedOverDate(null);
                        try {
                          const dataStr = e.dataTransfer.getData("text/plain");
                          if (!dataStr) return;
                          const data = JSON.parse(dataStr);
                          
                          if (data.source === "library") {
                            handleScheduleSession(data.sessionData, dayItem.dateKey, data.type);
                          } else if (data.source === "calendar") {
                            handleMoveScheduledSession(data.scheduledId, dayItem.dateKey);
                          }
                        } catch (err) {
                          console.error("Drop failed", err);
                        }
                      }}
                      className={`min-h-[110px] p-2 border-r border-b border-gray-850 flex flex-col justify-between transition-all duration-200 relative ${
                        isCurrentMonth ? "bg-gray-900/10" : "bg-gray-955/5 text-gray-600 opacity-30"
                      } ${isDragOver ? "bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30" : ""} ${
                        cellIdx % 7 === 6 ? "border-r-0" : ""
                      }`}
                    >
                      {/* Date Header */}
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[10px] font-mono font-bold tracking-tight rounded-md px-1.5 py-0.5 ${
                          isToday 
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" 
                            : isCurrentMonth ? "text-gray-400 font-semibold" : "text-gray-600"
                        }`}>
                          {dayItem.day}
                        </span>

                        {/* Quick-add schedule helper menu button */}
                        <div className="relative group/quickadd">
                          <button
                            id={`btn-quick-add-${dayItem.dateKey}`}
                            title="Quick schedule"
                            className="p-0.5 hover:bg-gray-850 rounded text-gray-500 hover:text-emerald-400 transition cursor-pointer opacity-0 group-hover/quickadd:opacity-100 focus/quickadd:opacity-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Quick Add Dropdown Menu */}
                          <div className="absolute right-0 top-5 hidden group-hover/quickadd:block hover/quickadd:block bg-gray-950 border border-gray-850 rounded-lg shadow-2xl py-1.5 w-52 z-30 text-left">
                            <span className="text-[9px] font-mono font-bold uppercase text-gray-500 block px-3 py-1 border-b border-gray-900 mb-1">
                              Quick Schedule:
                            </span>
                            {PRE_BUILT_TEMPLATES.map((tmpl) => (
                              <button
                                key={tmpl.id}
                                id={`quick-schedule-tmpl-${tmpl.id}-${dayItem.dateKey}`}
                                onClick={() => {
                                  handleScheduleSession(tmpl, dayItem.dateKey, "template");
                                }}
                                className="w-full text-left px-3 py-1 text-[10px] hover:bg-gray-900 text-gray-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              >
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                <span className="truncate">{tmpl.title}</span>
                              </button>
                            ))}
                            {trainingSessions.length > 0 && (
                              <>
                                <div className="h-[1px] bg-gray-900 my-1"></div>
                                <span className="text-[9px] font-mono font-bold uppercase text-gray-500 block px-3 py-1">
                                  Saved AI Sessions:
                                </span>
                                {trainingSessions.slice(0, 3).map((sess) => (
                                  <button
                                    key={sess.id}
                                    id={`quick-schedule-saved-${sess.id}-${dayItem.dateKey}`}
                                    onClick={() => {
                                      handleScheduleSession(sess, dayItem.dateKey, "saved");
                                    }}
                                    className="w-full text-left px-3 py-1 text-[10px] hover:bg-gray-900 text-gray-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    <span className="truncate">AI: {sess.goalText}</span>
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sessions inside cell */}
                      <div className="flex-1 space-y-1 overflow-y-auto max-h-[75px] pr-0.5 custom-scrollbar">
                        {daySessions.map((item) => {
                          const catColor = 
                            item.category === "Possession" ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30" :
                            item.category === "Defending" ? "bg-sky-950/60 text-sky-400 border-sky-900/50 hover:bg-sky-900/30" :
                            item.category === "Attacking" ? "bg-amber-950/60 text-amber-400 border-amber-900/50 hover:bg-amber-900/30" :
                            item.category === "Set Pieces" ? "bg-indigo-950/60 text-indigo-400 border-indigo-900/50 hover:bg-indigo-900/30" :
                            "bg-pink-950/60 text-pink-400 border-pink-900/50 hover:bg-pink-900/30";

                          return (
                            <div
                              key={item.id}
                              id={`scheduled-session-card-${item.id}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", JSON.stringify({
                                  source: "calendar",
                                  scheduledId: item.id,
                                  currentDate: item.date
                                }));
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedScheduledSession(item);
                              }}
                              className={`group/card text-[10px] font-medium border rounded p-1 cursor-grab active:cursor-grabbing transition-all relative flex flex-col justify-between ${catColor}`}
                            >
                              <div className="truncate font-semibold tracking-tight pr-4">
                                {item.title}
                              </div>
                              <div className="text-[8px] opacity-75 font-mono mt-0.5 flex justify-between items-center">
                                <span>{item.durationMins}m</span>
                                <span className="opacity-60">{item.playerCount}p</span>
                              </div>

                              {/* Unschedule button */}
                              <button
                                id={`btn-delete-scheduled-${item.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnscheduleSession(item.id);
                                }}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded hover:bg-red-950 text-gray-500 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition cursor-pointer"
                                title="Remove session"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Library Sidebar Panel */}
          <div className="xl:col-span-1 space-y-4" id="calendar-library-sidebar">
            
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">
                  Session Library
                </h3>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Drag and drop these sessions onto any calendar cell to schedule them. Re-drag on the calendar to move them.
              </p>

              {/* Filters & Search */}
              <div className="space-y-3 pt-1.5" id="library-filters-container">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    id="library-search-input"
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Search sessions..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                {/* Category tags */}
                <div className="flex flex-wrap gap-1.5" id="library-category-tags">
                  {["All", "Possession", "Set Pieces", "Defending", "Attacking"].map((cat) => (
                    <button
                      key={cat}
                      id={`btn-filter-category-${cat}`}
                      onClick={() => setSidebarCategory(cat)}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase font-mono rounded border transition cursor-pointer ${
                        sidebarCategory === cat
                          ? "bg-indigo-950 border-indigo-500 text-indigo-400"
                          : "bg-gray-950 border-gray-850 text-gray-500 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus templates vs Custom AI templates */}
              <div className="grid grid-cols-2 bg-gray-950 p-1 rounded-lg border border-gray-850" id="library-tab-toggle">
                <button
                  id="tab-library-templates"
                  onClick={() => setSelectedLibraryTab("templates")}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    selectedLibraryTab === "templates"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Syllabus Templates
                </button>
                <button
                  id="tab-library-saved"
                  onClick={() => setSelectedLibraryTab("saved")}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    selectedLibraryTab === "saved"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Saved AI ({trainingSessions.length})
                </button>
              </div>

              {/* Library list scroll window */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar" id="library-items-list">
                {selectedLibraryTab === "templates" ? (
                  (() => {
                    const filtered = PRE_BUILT_TEMPLATES.filter(tmpl => {
                      const matchesSearch = tmpl.title.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
                                           tmpl.description.toLowerCase().includes(sidebarSearch.toLowerCase());
                      const matchesCat = sidebarCategory === "All" || tmpl.category === sidebarCategory;
                      return matchesSearch && matchesCat;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-600 text-xs font-mono">
                          No matching templates found.
                        </div>
                      );
                    }

                    return filtered.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        id={`library-tmpl-${tmpl.id}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", JSON.stringify({
                            source: "library",
                            type: "template",
                            sessionData: tmpl
                          }));
                        }}
                        className="bg-gray-950 border border-gray-850 hover:border-indigo-500/50 rounded-lg p-3 cursor-grab active:cursor-grabbing transition group select-none"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wide text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">
                            {tmpl.category}
                          </span>
                          <span className="text-[8px] text-gray-500 font-mono">
                            {tmpl.durationMins} mins
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-200 mt-1.5 text-xs group-hover:text-white transition">
                          {tmpl.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">
                          {tmpl.description}
                        </p>
                        <div className="mt-2 text-[8px] text-gray-500 font-mono flex justify-between items-center border-t border-gray-900 pt-1.5">
                          <span>{tmpl.drills.length} drills</span>
                          <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            DRAG TO SCHEDULE →
                          </span>
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  (() => {
                    const filtered = trainingSessions.filter(sess => {
                      const matchesSearch = sess.goalText.toLowerCase().includes(sidebarSearch.toLowerCase());
                      const matchesCat = sidebarCategory === "All"; 
                      return matchesSearch && matchesCat;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-600 text-xs leading-relaxed space-y-2">
                          <p>No saved AI sessions match.</p>
                          <p className="text-[10px] text-gray-500">
                            Go to <strong>AI Session Builder</strong> tab, specs your goal, click "Build Session with AI" and click Save!
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((sess) => {
                      const simpleTitle = `AI: ${sess.goalText.substring(0, 30)}...`;
                      const mockDataWithCategory = {
                        ...sess,
                        title: simpleTitle,
                        category: "Possession" // default category color
                      };

                      return (
                        <div
                          key={sess.id}
                          id={`library-saved-${sess.id}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", JSON.stringify({
                              source: "library",
                              type: "saved",
                              sessionData: mockDataWithCategory
                            }));
                          }}
                          className="bg-gray-950 border border-gray-850 hover:border-emerald-500/50 rounded-lg p-3 cursor-grab active:cursor-grabbing transition group select-none"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono font-bold uppercase tracking-wide text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                              AI Custom
                            </span>
                            <span className="text-[8px] text-gray-500 font-mono">
                              {sess.durationMins} mins
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-200 mt-1.5 text-xs group-hover:text-white transition line-clamp-1">
                            {sess.goalText}
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-1 leading-snug font-mono text-[9px]">
                            {sess.drills.length} training drills compiled
                          </p>
                          <div className="mt-2 text-[8px] text-gray-500 font-mono flex justify-between items-center border-t border-gray-900 pt-1.5">
                            <span>{sess.playerCount} Players</span>
                            <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                              DRAG TO SCHEDULE →
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>

            </div>

          </div>

          {/* SYLLABUS DETAIL MODAL popup */}
          {selectedScheduledSession && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="syllabus-modal-overlay">
              <div 
                className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-scale-up"
                id="syllabus-modal-box"
              >
                
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-900/40">
                        {selectedScheduledSession.category} session
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedScheduledSession.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedScheduledSession.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Objective: <span className="font-semibold text-emerald-400">"{selectedScheduledSession.goalText}"</span>
                    </p>
                  </div>
                  
                  <button
                    id="btn-close-syllabus-modal"
                    onClick={() => setSelectedScheduledSession(null)}
                    className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-lg transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Specs grids */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950 border border-gray-850 rounded-xl p-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Total Duration</span>
                      <span className="text-xs font-bold text-white font-mono">{selectedScheduledSession.durationMins} minutes</span>
                    </div>
                  </div>
                  <div className="bg-gray-950 border border-gray-850 rounded-xl p-3 flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Squad Requirement</span>
                      <span className="text-xs font-bold text-white font-mono">{selectedScheduledSession.playerCount} outfield players</span>
                    </div>
                  </div>
                </div>

                {/* Drills timeline */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-gray-400">
                    Drill Breakdown ({selectedScheduledSession.drills.length} items)
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedScheduledSession.drills.map((dr, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-950 border border-gray-850 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            DRILL 0{idx + 1}
                          </span>
                          <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dr.duration} mins
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-white text-xs">{dr.name}</h5>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            {dr.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[10px] border-t border-gray-900">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-500 uppercase font-mono block">Coaching Cues:</span>
                            <ul className="list-disc list-inside text-emerald-300/80 space-y-0.5">
                              {dr.coachingCues.map((cue, cidx) => (
                                <li key={cidx}>{cue}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-gray-500 uppercase font-mono block">Required Equipment:</span>
                            <p className="text-gray-400 font-mono">
                              {dr.equipment.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex justify-end gap-3 border-t border-gray-850 pt-4 mt-2">
                  <button
                    id="btn-delete-scheduled-modal"
                    onClick={() => {
                      handleUnscheduleSession(selectedScheduledSession.id);
                      setSelectedScheduledSession(null);
                    }}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-900/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete from Calendar</span>
                  </button>
                  <button
                    id="btn-dismiss-syllabus-modal"
                    onClick={() => setSelectedScheduledSession(null)}
                    className="px-4 py-2 bg-gray-950 hover:bg-gray-850 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
