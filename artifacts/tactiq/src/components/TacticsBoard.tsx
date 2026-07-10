import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Play, 
  ChevronRight, 
  Sparkles, 
  Save, 
  Undo2, 
  Redo2,
  BookOpen,
  Maximize2,
  CheckCircle,
  Move,
  Type as TextIcon,
  CircleDot,
  ArrowUpRight,
  Brain,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Tactic, Player, TacticalArrow, PressZone, TextLabel, TacticPhase } from "../types";
import { LogoIcon } from "./Logo";

// Standard Formations Database
export const FORMATION_COORDINATES: Record<string, { role: "GK" | "DEF" | "MID" | "ATT"; pos: string; x: number; y: number; name: string }[]> = {
  "4-3-3": [
    { role: "GK", pos: "GK", x: 50, y: 92, name: "Ederson" },
    { role: "DEF", pos: "CB", x: 38, y: 78, name: "Dias" },
    { role: "DEF", pos: "CB", x: 62, y: 78, name: "Stones" },
    { role: "DEF", pos: "LB", x: 15, y: 68, name: "Gvardiol" },
    { role: "DEF", pos: "RB", x: 85, y: 68, name: "Walker" },
    { role: "MID", pos: "DM", x: 50, y: 58, name: "Rodri" },
    { role: "MID", pos: "CM", x: 33, y: 46, name: "De Bruyne" },
    { role: "MID", pos: "CM", x: 67, y: 46, name: "Bernardo" },
    { role: "ATT", pos: "LW", x: 20, y: 26, name: "Grealish" },
    { role: "ATT", pos: "RW", x: 80, y: 26, name: "Foden" },
    { role: "ATT", pos: "ST", x: 50, y: 20, name: "Haaland" },
  ],
  "3-5-2": [
    { role: "GK", pos: "GK", x: 50, y: 92, name: "Ederson" },
    { role: "DEF", pos: "CB", x: 30, y: 78, name: "Ake" },
    { role: "DEF", pos: "CB", x: 50, y: 80, name: "Dias" },
    { role: "DEF", pos: "CB", x: 70, y: 78, name: "Akanji" },
    { role: "MID", pos: "LWB", x: 12, y: 54, name: "Doku" },
    { role: "MID", pos: "RWB", x: 88, y: 54, name: "Savinho" },
    { role: "MID", pos: "CM", x: 35, y: 48, name: "Kovacic" },
    { role: "MID", pos: "DM", x: 50, y: 62, name: "Rodri" },
    { role: "MID", pos: "CM", x: 65, y: 48, name: "Gundogan" },
    { role: "ATT", pos: "ST", x: 40, y: 22, name: "Alvarez" },
    { role: "ATT", pos: "ST", x: 60, y: 22, name: "Haaland" },
  ],
  "4-4-2": [
    { role: "GK", pos: "GK", x: 50, y: 92, name: "Ederson" },
    { role: "DEF", pos: "CB", x: 38, y: 78, name: "Dias" },
    { role: "DEF", pos: "CB", x: 62, y: 78, name: "Stones" },
    { role: "DEF", pos: "LB", x: 15, y: 68, name: "Gvardiol" },
    { role: "DEF", pos: "RB", x: 85, y: 68, name: "Walker" },
    { role: "MID", pos: "CM", x: 38, y: 50, name: "Rodri" },
    { role: "MID", pos: "CM", x: 62, y: 50, name: "Gundogan" },
    { role: "MID", pos: "LM", x: 15, y: 45, name: "Grealish" },
    { role: "MID", pos: "RM", x: 85, y: 45, name: "Foden" },
    { role: "ATT", pos: "ST", x: 42, y: 22, name: "Bobb" },
    { role: "ATT", pos: "ST", x: 58, y: 22, name: "Haaland" },
  ],
  "4-2-3-1": [
    { role: "GK", pos: "GK", x: 50, y: 92, name: "Ederson" },
    { role: "DEF", pos: "CB", x: 38, y: 78, name: "Dias" },
    { role: "DEF", pos: "CB", x: 62, y: 78, name: "Stones" },
    { role: "DEF", pos: "LB", x: 15, y: 68, name: "Gvardiol" },
    { role: "DEF", pos: "RB", x: 85, y: 68, name: "Walker" },
    { role: "MID", pos: "DM", x: 38, y: 62, name: "Rodri" },
    { role: "MID", pos: "DM", x: 62, y: 62, name: "Kovacic" },
    { role: "MID", pos: "AM", x: 50, y: 42, name: "De Bruyne" },
    { role: "MID", pos: "LM", x: 18, y: 35, name: "Foden" },
    { role: "MID", pos: "RM", x: 82, y: 35, name: "Savinho" },
    { role: "ATT", pos: "ST", x: 50, y: 20, name: "Haaland" },
  ],
};

interface TacticsBoardProps {
  tactic: Tactic | null;
  onSaveTactic: (tactic: Tactic) => void;
  onBackToDashboard: () => void;
}

export default function TacticsBoard({
  tactic,
  onSaveTactic,
  onBackToDashboard
}: TacticsBoardProps) {
  // Setup full tactic object state (default if none provided)
  const [boardTactic, setBoardTactic] = useState<Tactic>(() => {
    if (tactic) return JSON.parse(JSON.stringify(tactic));
    const defaultPhase: TacticPhase = {
      id: "phase-bu",
      name: "Build-up",
      canvasData: {
        players: FORMATION_COORDINATES["4-3-3"].map((p, i) => ({
          id: `player-${i + 1}`,
          name: p.name,
          number: i + 1 === 1 ? 1 : i + 8, // simple numbering
          role: p.role,
          positionName: p.pos,
          x: p.x,
          y: p.y
        })),
        arrows: [],
        zones: [
          { id: "zone-initial", x: 35, y: 40, width: 30, height: 18, type: "rectangle" }
        ],
        defensiveLine: { y: 75, visible: true },
        labels: [
          { id: "label-initial", text: "Maintain vertical compactness", x: 35, y: 62 }
        ]
      }
    };

    return {
      id: "tactic-" + Date.now(),
      title: "My 4-3-3 High Press Plan",
      formation: "4-3-3",
      phases: [
        defaultPhase,
        {
          id: "phase-att",
          name: "Attack",
          canvasData: {
            ...defaultPhase.canvasData,
            // push wingers high
            players: defaultPhase.canvasData.players.map(p => {
              if (p.role === "ATT") return { ...p, y: p.y - 10 };
              if (p.role === "MID") return { ...p, y: p.y - 6 };
              return p;
            })
          }
        },
        {
          id: "phase-def",
          name: "Defence",
          canvasData: {
            ...defaultPhase.canvasData,
            // drop back
            players: defaultPhase.canvasData.players.map(p => {
              if (p.role === "ATT") return { ...p, y: p.y + 15 };
              if (p.role === "MID") return { ...p, y: p.y + 12 };
              if (p.role === "DEF") return { ...p, y: p.y + 8 };
              return p;
            })
          }
        }
      ],
      activePhaseId: "phase-bu",
      styleTags: ["Press", "Overloads"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const activePhase = boardTactic.phases.find(p => p.id === boardTactic.activePhaseId) || boardTactic.phases[0];
  const { players, arrows, zones, defensiveLine, labels } = activePhase.canvasData;

  // Active Tool state
  const [activeTool, setActiveTool] = useState<"select" | "arrow" | "zone" | "label">("select");
  const [arrowType, setArrowType] = useState<"pass" | "run" | "press">("pass");
  
  // Dragging states
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [draggingDefensiveLine, setDraggingDefensiveLine] = useState<boolean>(false);

  // Active Selected Element for Nudge Controls and detailed inspection
  const [selectedElement, setSelectedElement] = useState<{ id: string; type: "player" | "zone" | "label" | "defline" } | null>(null);

  // Undo and Redo memory stacks
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  const [redoHistory, setRedoHistory] = useState<string[]>([]);

  // AI Assistant Context state
  const [aiChat, setAiChat] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Welcome to TactIQ Coaching Panel. Build your board, add notes, and ask me how to neutralize your opponent!" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"settings" | "board" | "coach">("board");

  // 8-Second Idle Nudge timer
  const [showIdleNudge, setShowIdleNudge] = useState<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // SVG Pitch Ref for coordinate mapping
  const pitchRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state for the tactical pitch
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);

  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 2.5;

  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));

  const zoomIn = () => setZoomLevel(z => clampZoom(parseFloat((z + 0.2).toFixed(2))));
  const zoomOut = () => setZoomLevel(z => clampZoom(parseFloat((z - 0.2).toFixed(2))));
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePitchWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoomLevel(z => clampZoom(parseFloat((z - e.deltaY * 0.001).toFixed(2))));
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  // Reset idle timer on player drags
  const resetIdleTimer = () => {
    setShowIdleNudge(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setShowIdleNudge(true);
    }, 8000); // 8 seconds as requested in page 18 of PDF
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [players]);

  // Save historical state for undo and clear redo on brand new actions
  const snapshotState = () => {
    const currentSerialized = JSON.stringify(boardTactic);
    setUndoHistory(prev => [currentSerialized, ...prev].slice(0, 25)); // Keep up to 25 snapshots
    setRedoHistory([]); // Clear redo buffer on new action
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const [previous, ...rest] = undoHistory;
    const currentSerialized = JSON.stringify(boardTactic);
    setRedoHistory(prev => [currentSerialized, ...prev].slice(0, 25));
    setBoardTactic(JSON.parse(previous));
    setUndoHistory(rest);
    setSelectedElement(null); // Clear selected element to avoid mismatch
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const [next, ...rest] = redoHistory;
    const currentSerialized = JSON.stringify(boardTactic);
    setUndoHistory(prev => [currentSerialized, ...prev].slice(0, 25));
    setBoardTactic(JSON.parse(next));
    setRedoHistory(rest);
    setSelectedElement(null); // Clear selected element to avoid mismatch
  };

  // Safe canvas update with optional skipSnapshot flag (crucial for lag-free dragging!)
  const updateCanvas = (
    updater: (data: typeof activePhase.canvasData) => typeof activePhase.canvasData,
    skipSnapshot = false
  ) => {
    if (!skipSnapshot) {
      snapshotState();
    }
    const updatedPhases = boardTactic.phases.map(p => {
      if (p.id === boardTactic.activePhaseId) {
        return {
          ...p,
          canvasData: updater(p.canvasData)
        };
      }
      return p;
    });
    setBoardTactic(prev => ({
      ...prev,
      phases: updatedPhases,
      updatedAt: new Date().toISOString()
    }));
  };

  // Reposition players based on formation selection
  const handleFormationChange = (formName: string) => {
    const coords = FORMATION_COORDINATES[formName];
    if (!coords) return;

    updateCanvas((data) => {
      const updatedPlayers = data.players.map((p, idx) => {
        const c = coords[idx] || coords[0];
        return {
          ...p,
          x: c.x,
          y: c.y,
          positionName: c.pos,
          name: c.name
        };
      });
      return {
        ...data,
        players: updatedPlayers
      };
    });

    setBoardTactic(prev => ({
      ...prev,
      formation: formName
    }));
  };

  // Add Phase
  const handleAddPhase = () => {
    const phaseNames = ["Build-up", "Attack", "Defence", "Midblock", "Counter"];
    const currentCount = boardTactic.phases.length;
    const newName = phaseNames[currentCount % phaseNames.length] + ` ${Math.floor(currentCount / 5) + 1}`;
    const newId = `phase-${Date.now()}`;
    const newPhase: TacticPhase = {
      id: newId,
      name: newName,
      canvasData: JSON.parse(JSON.stringify(activePhase.canvasData))
    };

    setBoardTactic(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase],
      activePhaseId: newId
    }));
  };

  // Play/Animate Phases sequence
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const handleAnimate = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const initialPhaseId = boardTactic.activePhaseId;
    
    for (const phase of boardTactic.phases) {
      setBoardTactic(prev => ({ ...prev, activePhaseId: phase.id }));
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setBoardTactic(prev => ({ ...prev, activePhaseId: initialPhaseId }));
    setIsAnimating(false);
  };

  // SVG Mouse/Touch coordinate converter
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!pitchRef.current) return null;
    const rect = pitchRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  // Drag Handlers
  const handlePitchStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Two-finger pinch-to-zoom start
    if ("touches" in e && e.touches.length === 2) {
      pinchStartRef.current = { dist: getTouchDistance(e.touches), zoom: zoomLevel };
      return;
    }

    resetIdleTimer();
    const coords = getCoordinates(e);
    if (!coords) return;

    const isTouch = "touches" in e;
    const clickRadius = isTouch ? 8 : 5.5;
    const labelRadius = isTouch ? 9 : 6.5;

    // Check click targets
    // 1. Label
    const clickedLabel = labels.find(l => {
      const dist = Math.hypot(l.x - coords.x, l.y - coords.y);
      return dist < labelRadius;
    });
    if (clickedLabel) {
      snapshotState(); // Single snapshot right before drag begins
      setDraggingLabelId(clickedLabel.id);
      setSelectedElement({ id: clickedLabel.id, type: "label" });
      return;
    }

    // 2. Player
    const clickedPlayer = players.find(p => {
      const dist = Math.hypot(p.x - coords.x, p.y - coords.y);
      return dist < clickRadius;
    });
    if (clickedPlayer) {
      snapshotState(); // Single snapshot right before drag begins
      setDraggingPlayerId(clickedPlayer.id);
      setSelectedElement({ id: clickedPlayer.id, type: "player" });
      return;
    }

    // 3. Press Zone
    const clickedZone = zones.find(z => {
      const inX = coords.x >= z.x && coords.x <= z.x + z.width;
      const inY = coords.y >= z.y && coords.y <= z.y + z.height;
      return inX && inY;
    });
    if (clickedZone) {
      snapshotState(); // Single snapshot right before drag begins
      setDraggingZoneId(clickedZone.id);
      setSelectedElement({ id: clickedZone.id, type: "zone" });
      return;
    }

    // 4. Defensive Line
    if (defensiveLine.visible && Math.abs(coords.y - defensiveLine.y) < (isTouch ? 6 : 4)) {
      snapshotState(); // Single snapshot right before drag begins
      setDraggingDefensiveLine(true);
      setSelectedElement({ id: "defline", type: "defline" });
      return;
    }

    // Canvas click action based on selected Tool (Empty pitch tap/click)
    if (activeTool === "label") {
      const text = prompt("Enter label text:", "Tactical block");
      if (text) {
        updateCanvas(data => ({
          ...data,
          labels: [...data.labels, { id: `lbl-${Date.now()}`, text, x: coords.x, y: coords.y }]
        }));
      }
      setActiveTool("select");
    } else if (activeTool === "zone") {
      updateCanvas(data => ({
        ...data,
        zones: [...data.zones, { id: `zn-${Date.now()}`, x: coords.x - 10, y: coords.y - 8, width: 20, height: 16, type: "rectangle" }]
      }));
      setActiveTool("select");
    } else {
      // Tap on empty space on Select tool clears active selection
      setSelectedElement(null);
    }
  };

  const handlePitchMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Two-finger pinch-to-zoom move
    if ("touches" in e && e.touches.length === 2 && pinchStartRef.current) {
      if (e.cancelable) e.preventDefault();
      const newDist = getTouchDistance(e.touches);
      const ratio = newDist / pinchStartRef.current.dist;
      setZoomLevel(clampZoom(parseFloat((pinchStartRef.current.zoom * ratio).toFixed(2))));
      return;
    }

    if (!draggingPlayerId && !draggingZoneId && !draggingLabelId && !draggingDefensiveLine) return;
    
    // Lock viewport scrolling on iOS Safari while actively dragging tactics!
    if (e.cancelable) {
      e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    if (draggingPlayerId) {
      updateCanvas(data => ({
        ...data,
        players: data.players.map(p => p.id === draggingPlayerId ? { ...p, x: coords.x, y: coords.y } : p)
      }), true); // pass skipSnapshot=true for 60fps drag rendering!
    } else if (draggingZoneId) {
      updateCanvas(data => ({
        ...data,
        zones: data.zones.map(z => z.id === draggingZoneId ? { ...z, x: coords.x - z.width / 2, y: coords.y - z.height / 2 } : z)
      }), true); // pass skipSnapshot=true!
    } else if (draggingLabelId) {
      updateCanvas(data => ({
        ...data,
        labels: data.labels.map(l => l.id === draggingLabelId ? { ...l, x: coords.x, y: coords.y } : l)
      }), true); // pass skipSnapshot=true!
    } else if (draggingDefensiveLine) {
      updateCanvas(data => ({
        ...data,
        defensiveLine: { ...data.defensiveLine, y: coords.y }
      }), true); // pass skipSnapshot=true!
    }
  };

  const handlePitchEnd = () => {
    pinchStartRef.current = null;
    setDraggingPlayerId(null);
    setDraggingZoneId(null);
    setDraggingLabelId(null);
    setDraggingDefensiveLine(false);
  };

  // Add Passing/Movement arrow from selected player
  const handleAddArrowFromPlayer = (playerId: string) => {
    const p = players.find(x => x.id === playerId);
    if (!p) return;
    updateCanvas(data => ({
      ...data,
      arrows: [
        ...data.arrows,
        {
          id: `arr-${Date.now()}`,
          fromId: playerId,
          toX: p.x,
          toY: p.y - 15, // standard forward arrow
          type: arrowType,
          color: arrowType === "pass" ? "green" : arrowType === "run" ? "blue" : "red"
        }
      ]
    }));
  };

  // AI Assistant Chat trigger
  const handleSendChat = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || chatInput;
    if (!promptToSend.trim()) return;

    setAiChat(prev => [...prev, { sender: "user", text: promptToSend }]);
    setChatInput("");
    setLoadingAi(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";

      const res = await fetch(`${API_URL}/api/gemini/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeTactic: boardTactic,
          currentPhase: activePhase,
          prompt: promptToSend
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiChat(prev => [...prev, { sender: "ai", text: data.text }]);
      } else {
        throw new Error("Coach route error");
      }
    } catch (err) {
      setAiChat(prev => [
        ...prev,
        {
          sender: "ai",
          text: `[Offline Fallback] As a ${boardTactic.formation} tactician, to secure the team's balance, recommend dropping your central midfielders deeper. This limits quick transition counters and closes vertical passing channels. Let's practice with the transition slide!`
        }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  // Apply quick suggestion trigger (Clippy prompt page 18)
  const handleApplySuggestion = () => {
    snapshotState();
    setShowIdleNudge(false);

    // Apply specific tactical coordinate adjustments (e.g., drop striker 10m, pull mids together)
    updateCanvas(data => {
      const updatedPlayers = data.players.map(p => {
        if (p.role === "ATT" && p.positionName === "ST") {
          return { ...p, y: p.y + 10 }; // Drop striker 10m deeper
        }
        if (p.role === "MID") {
          return { ...p, y: p.y - 2 }; // Pull mids closer to connect
        }
        return p;
      });

      const suggestLabel: TextLabel = {
        id: `lbl-${Date.now()}`,
        text: "Striker dropped deep (False 9)",
        x: 50,
        y: 35
      };

      const suggestArrow: TacticalArrow = {
        id: `arr-${Date.now()}`,
        fromId: "player-11", // Haaland
        toX: 50,
        toY: 34,
        type: "run",
        color: "blue"
      };

      return {
        ...data,
        players: updatedPlayers,
        labels: [...data.labels, suggestLabel],
        arrows: [...data.arrows, suggestArrow]
      };
    });

    setAiChat(prev => [
      ...prev,
      {
        sender: "ai",
        text: "Applied: Striker Haaland dropped deep into the False-9 position. This draws out CBs and creates wing entry lanes. How does this layout look?"
      }
    ]);
  };

  const handleDeleteElement = (id: string, type: "arrow" | "zone" | "label") => {
    updateCanvas(data => {
      if (type === "arrow") return { ...data, arrows: data.arrows.filter(a => a.id !== id) };
      if (type === "zone") return { ...data, zones: data.zones.filter(z => z.id !== id) };
      return { ...data, labels: data.labels.filter(l => l.id !== id) };
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-950 text-gray-100 overflow-hidden select-none">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-gray-900 bg-gray-950 sticky top-0 z-50 p-2.5 gap-1.5 shrink-0">
        <button
          onClick={() => setMobileTab("settings")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded text-center transition-all ${
            mobileTab === "settings"
              ? "bg-emerald-950/65 text-emerald-400 border border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "text-gray-400 hover:text-white bg-gray-900/30 border border-transparent"
          }`}
        >
          ⚙️ Tools
        </button>
        <button
          onClick={() => setMobileTab("board")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded text-center transition-all ${
            mobileTab === "board"
              ? "bg-emerald-950/65 text-emerald-400 border border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "text-gray-400 hover:text-white bg-gray-900/30 border border-transparent"
          }`}
        >
          📋 Pitch
        </button>
        <button
          onClick={() => setMobileTab("coach")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded text-center transition-all ${
            mobileTab === "coach"
              ? "bg-emerald-950/65 text-emerald-400 border border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "text-gray-400 hover:text-white bg-gray-900/30 border border-transparent"
          }`}
        >
          🧠 AI Coach
        </button>
      </div>

      {/* LEFT CONTROL RAIL / BOARD SETTINGS */}
      <div className={`w-full lg:w-80 border-r border-gray-900 flex flex-col justify-between bg-gray-950 shrink-0 p-4 space-y-4 overflow-y-auto flex-1 lg:flex-initial lg:h-full ${mobileTab === "settings" ? "flex" : "hidden lg:flex"}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              id="btn-back-dashboard"
              onClick={onBackToDashboard}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <span className="text-[10px] font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/50 text-emerald-300 font-bold uppercase">
              V1.0 Board
            </span>
          </div>

          <div className="space-y-1">
            <input 
              id="input-tactic-title"
              type="text"
              value={boardTactic.title}
              onChange={(e) => setBoardTactic(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-bold bg-transparent text-white border-b border-transparent hover:border-gray-800 focus:border-emerald-500 focus:outline-none w-full py-0.5"
            />
            <p className="text-xs text-gray-400">Tactics Board Canvas</p>
          </div>

          {/* Visual Team Formation Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
              Select Team Formation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "4-3-3", title: "4-3-3 Wingers", desc: "Attack Wide & Counter-Press" },
                { name: "3-5-2", title: "3-5-2 Wingbacks", desc: "Overloads & Midfield Control" },
                { name: "4-4-2", title: "4-4-2 Block", desc: "Compact Flat Defensive Lines" },
                { name: "4-2-3-1", title: "4-2-3-1 Pivot", desc: "Double Pivot & Playmaking" }
              ].map((f) => {
                const isSelected = boardTactic.formation === f.name;
                return (
                  <button
                    key={f.name}
                    onClick={() => handleFormationChange(f.name)}
                    className={`p-2 rounded text-left transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-emerald-950/50 border border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)] font-semibold"
                        : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-mono flex items-center justify-between">
                      <span>{f.title}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick interactive palette tools */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
              Visual Annotation Tools
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-tool-select"
                onClick={() => setActiveTool("select")}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                  activeTool === "select"
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <Move className="w-4 h-4" />
                <span>Move / Select</span>
              </button>
              <button
                id="btn-tool-label"
                onClick={() => setActiveTool("label")}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                  activeTool === "label"
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
                title="Click anywhere on the pitch to place a text note label"
              >
                <TextIcon className="w-4 h-4" />
                <span>Text Note</span>
              </button>
              <button
                id="btn-tool-zone"
                onClick={() => setActiveTool("zone")}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                  activeTool === "zone"
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
                title="Click anywhere on the pitch to place a high-press zone block"
              >
                <CircleDot className="w-4 h-4" />
                <span>Press Zone</span>
              </button>
              <button
                id="btn-tool-toggle-defline"
                onClick={() => {
                  snapshotState();
                  updateCanvas(data => ({
                    ...data,
                    defensiveLine: { ...data.defensiveLine, visible: !data.defensiveLine.visible }
                  }));
                }}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                  defensiveLine.visible
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                <span>Def. Line</span>
              </button>
            </div>
          </div>

          {/* Quick arrow drawers */}
          <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-900 space-y-2">
            <span className="text-[10px] font-mono text-gray-500 block uppercase tracking-wider">
              Arrow Creator Type
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setArrowType("pass"); setActiveTool("arrow"); }}
                className={`px-2 py-1 text-[10px] font-bold font-mono rounded border cursor-pointer ${
                  arrowType === "pass" && activeTool === "arrow" ? "bg-emerald-900/60 border-emerald-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400"
                }`}
              >
                🟢 Pass
              </button>
              <button
                onClick={() => { setArrowType("run"); setActiveTool("arrow"); }}
                className={`px-2 py-1 text-[10px] font-bold font-mono rounded border cursor-pointer ${
                  arrowType === "run" && activeTool === "arrow" ? "bg-blue-900/60 border-blue-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400"
                }`}
              >
                🔵 Run Run
              </button>
              <button
                onClick={() => { setArrowType("press"); setActiveTool("arrow"); }}
                className={`px-2 py-1 text-[10px] font-bold font-mono rounded border cursor-pointer ${
                  arrowType === "press" && activeTool === "arrow" ? "bg-red-900/60 border-red-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400"
                }`}
              >
                🔴 Pressing
              </button>
            </div>
            {activeTool === "arrow" && (
              <p className="text-[10px] text-emerald-400">
                💡 Click any player bubble on the pitch to add this arrow type!
              </p>
            )}
          </div>

          {/* Selected Element Nudge & Precision Control Panel (Mobile Friendly!) */}
          {selectedElement && (
            <div className="bg-emerald-950/10 rounded-lg border border-emerald-900/40 p-3 space-y-3 shadow-md animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  Target Controls
                </span>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-gray-500 hover:text-white text-[10px] font-mono cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              {selectedElement.type === "player" && (() => {
                const selPlayer = players.find(p => p.id === selectedElement.id);
                if (!selPlayer) return null;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-gray-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {selPlayer.number}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={selPlayer.name}
                          onChange={(e) => {
                            updateCanvas(data => ({
                              ...data,
                              players: data.players.map(p => p.id === selPlayer.id ? { ...p, name: e.target.value } : p)
                            }), true);
                          }}
                          className="bg-gray-900 border border-gray-800 focus:border-emerald-500 focus:outline-none rounded text-xs px-2 py-1 w-full text-white font-semibold"
                          placeholder="Rename player..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-gray-500 block text-center uppercase tracking-wider">
                        Fine Position Adjust (Nudge)
                      </span>
                      <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-1 w-24">
                          <div />
                          <button
                            onClick={() => {
                              updateCanvas(data => ({
                                ...data,
                                players: data.players.map(p => p.id === selPlayer.id ? { ...p, y: Math.max(0, p.y - 1) } : p)
                              }));
                            }}
                            className="p-1 bg-gray-900 hover:bg-gray-800 active:bg-emerald-600 rounded text-center text-xs text-white border border-gray-800 cursor-pointer"
                          >
                            ▲
                          </button>
                          <div />
                          <button
                            onClick={() => {
                              updateCanvas(data => ({
                                ...data,
                                players: data.players.map(p => p.id === selPlayer.id ? { ...p, x: Math.max(0, p.x - 1) } : p)
                              }));
                            }}
                            className="p-1 bg-gray-900 hover:bg-gray-800 active:bg-emerald-600 rounded text-center text-xs text-white border border-gray-800 cursor-pointer"
                          >
                            ◀
                          </button>
                          <div className="flex items-center justify-center text-[9px] font-mono text-gray-500">
                            {Math.round(selPlayer.x)},{Math.round(selPlayer.y)}
                          </div>
                          <button
                            onClick={() => {
                              updateCanvas(data => ({
                                ...data,
                                players: data.players.map(p => p.id === selPlayer.id ? { ...p, x: Math.min(100, p.x + 1) } : p)
                              }));
                            }}
                            className="p-1 bg-gray-900 hover:bg-gray-800 active:bg-emerald-600 rounded text-center text-xs text-white border border-gray-800 cursor-pointer"
                          >
                            ▶
                          </button>
                          <div />
                          <button
                            onClick={() => {
                              updateCanvas(data => ({
                                ...data,
                                players: data.players.map(p => p.id === selPlayer.id ? { ...p, y: Math.min(100, p.y + 1) } : p)
                              }));
                            }}
                            className="p-1 bg-gray-900 hover:bg-gray-800 active:bg-emerald-600 rounded text-center text-xs text-white border border-gray-800 cursor-pointer"
                          >
                            ▼
                          </button>
                          <div />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedElement.type === "label" && (() => {
                const selLabel = labels.find(l => l.id === selectedElement.id);
                if (!selLabel) return null;
                return (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-gray-500 block">Edit Note Text:</span>
                    <input
                      type="text"
                      value={selLabel.text}
                      onChange={(e) => {
                        updateCanvas(data => ({
                          ...data,
                          labels: data.labels.map(l => l.id === selLabel.id ? { ...l, text: e.target.value } : l)
                        }), true);
                      }}
                      className="bg-gray-900 border border-gray-800 focus:border-emerald-500 focus:outline-none rounded text-xs px-2 py-1 w-full text-white"
                    />
                    <button
                      onClick={() => {
                        handleDeleteElement(selLabel.id, "label");
                        setSelectedElement(null);
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1 text-xs bg-red-950/40 hover:bg-red-900 border border-red-900/60 text-red-300 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Note</span>
                    </button>
                  </div>
                );
              })()}

              {selectedElement.type === "zone" && (() => {
                const selZone = zones.find(z => z.id === selectedElement.id);
                if (!selZone) return null;
                return (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-gray-500 block">Resize High Press Zone:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <button
                        onClick={() => {
                          updateCanvas(data => ({
                            ...data,
                            zones: data.zones.map(z => z.id === selZone.id ? { ...z, width: Math.max(10, z.width - 2) } : z)
                          }));
                        }}
                        className="py-1 bg-gray-900 hover:bg-gray-855 text-gray-300 rounded border border-gray-800 cursor-pointer"
                      >
                        Narrower
                      </button>
                      <button
                        onClick={() => {
                          updateCanvas(data => ({
                            ...data,
                            zones: data.zones.map(z => z.id === selZone.id ? { ...z, width: Math.min(60, z.width + 2) } : z)
                          }));
                        }}
                        className="py-1 bg-gray-900 hover:bg-gray-855 text-gray-300 rounded border border-gray-800 cursor-pointer"
                      >
                        Wider
                      </button>
                      <button
                        onClick={() => {
                          updateCanvas(data => ({
                            ...data,
                            zones: data.zones.map(z => z.id === selZone.id ? { ...z, height: Math.max(8, z.height - 2) } : z)
                          }));
                        }}
                        className="py-1 bg-gray-900 hover:bg-gray-855 text-gray-300 rounded border border-gray-800 cursor-pointer"
                      >
                        Shorter
                      </button>
                      <button
                        onClick={() => {
                          updateCanvas(data => ({
                            ...data,
                            zones: data.zones.map(z => z.id === selZone.id ? { ...z, height: Math.min(50, z.height + 2) } : z)
                          }));
                        }}
                        className="py-1 bg-gray-900 hover:bg-gray-855 text-gray-300 rounded border border-gray-800 cursor-pointer"
                      >
                        Taller
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        handleDeleteElement(selZone.id, "zone");
                        setSelectedElement(null);
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1 text-xs bg-red-950/40 hover:bg-red-900 border border-red-900/60 text-red-300 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Press Zone</span>
                    </button>
                  </div>
                );
              })()}

              {selectedElement.type === "defline" && (
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-gray-300 font-semibold">Active Defensive Line</p>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Height: {Math.round(100 - defensiveLine.y)}m. Drag on pitch or nudge:
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        updateCanvas(data => ({
                          ...data,
                          defensiveLine: { ...data.defensiveLine, y: Math.min(100, data.defensiveLine.y + 2) }
                        }));
                      }}
                      className="px-2.5 py-1 text-[10px] bg-gray-900 hover:bg-gray-800 text-gray-300 rounded border border-gray-800 cursor-pointer"
                    >
                      Drop Deeper (▼)
                    </button>
                    <button
                      onClick={() => {
                        updateCanvas(data => ({
                          ...data,
                          defensiveLine: { ...data.defensiveLine, y: Math.max(0, data.defensiveLine.y - 2) }
                        }));
                      }}
                      className="px-2.5 py-1 text-[10px] bg-gray-900 hover:bg-gray-800 text-gray-300 rounded border border-gray-800 cursor-pointer"
                    >
                      Push High (▲)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Board actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              id="btn-board-undo"
              onClick={handleUndo}
              disabled={undoHistory.length === 0}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded bg-gray-900 border border-gray-850 transition ${
                undoHistory.length === 0 ? "opacity-40 cursor-not-allowed text-gray-600 border-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
              }`}
              title="Undo last action"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              id="btn-board-redo"
              onClick={handleRedo}
              disabled={redoHistory.length === 0}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded bg-gray-900 border border-gray-850 transition ${
                redoHistory.length === 0 ? "opacity-40 cursor-not-allowed text-gray-600 border-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
              }`}
              title="Redo action"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo</span>
            </button>
            <button
              id="btn-board-save"
              onClick={() => {
                onSaveTactic(boardTactic);
                alert("Tactic layout saved successfully!");
              }}
              className="px-4 py-2 flex items-center justify-center gap-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shrink-0 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTRAL PITCH BOARD CANVAS */}
      <div className={`flex-1 flex flex-col justify-between p-4 relative overflow-y-auto lg:overflow-hidden bg-gray-950/40 h-full ${mobileTab === "board" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Phase / Slide Manager */}
        <div className="flex items-center justify-between border-b border-gray-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Tactical Slides:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[400px]">
              {boardTactic.phases.map((ph) => {
                const isActive = ph.id === boardTactic.activePhaseId;
                return (
                  <button
                    key={ph.id}
                    onClick={() => {
                      snapshotState();
                      setBoardTactic(prev => ({ ...prev, activePhaseId: ph.id }));
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition truncate cursor-pointer ${
                      isActive
                        ? "bg-emerald-900/40 border border-emerald-600 text-emerald-300"
                        : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {ph.name}
                  </button>
                );
              })}
              <button
                id="btn-add-board-phase"
                onClick={handleAddPhase}
                className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded border border-gray-800 text-emerald-400 cursor-pointer"
                title="Add Tactical Phase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="btn-board-animate"
              onClick={handleAnimate}
              disabled={isAnimating}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white cursor-pointer"
              title="Animate coordinate shifts across slides"
            >
              <Play className={`w-3.5 h-3.5 ${isAnimating ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isAnimating ? "Playing..." : "Animate"}</span>
            </button>
          </div>
        </div>

        {/* PITCH ZOOM/PAN WRAPPER */}
        <div className="relative flex-1 w-full my-4 overflow-hidden rounded-lg" style={{ minHeight: "500px" }}>
          {/* Zoom Controls */}
          <div className="absolute top-2 right-2 z-30 flex flex-col gap-1 bg-gray-950/90 border border-gray-800 rounded-lg p-1 shadow-lg">
            <button
              id="btn-pitch-zoom-in"
              onClick={zoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              aria-label="Zoom in on pitch"
              title="Zoom in"
              className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-pitch-zoom-out"
              onClick={zoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              aria-label="Zoom out on pitch"
              title="Zoom out"
              className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-pitch-zoom-reset"
              onClick={resetZoom}
              aria-label="Reset pitch zoom"
              title="Reset zoom"
              className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white cursor-pointer border-t border-gray-800"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {zoomLevel !== 1 && (
            <div className="absolute top-2 left-2 z-30 text-[10px] font-mono bg-gray-950/90 border border-gray-800 rounded px-2 py-1 text-emerald-400">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}

          <div
            ref={pitchRef}
            onMouseMove={handlePitchMove}
            onTouchMove={handlePitchMove}
            onMouseUp={handlePitchEnd}
            onTouchEnd={handlePitchEnd}
            onWheel={handlePitchWheel}
            className="football-pitch w-full h-full relative touch-none"
            style={{ minHeight: "500px", transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: pinchStartRef.current ? "none" : "transform 0.15s ease-out" }}
          >
          {/* Pitch Markings */}
          <div className="pitch-center-line" />
          <div className="pitch-center-circle" />
          <div className="pitch-penalty-box-top" />
          <div className="pitch-goal-area-top" />
          <div className="pitch-penalty-box-bottom" />
          <div className="pitch-goal-area-bottom" />

          {/* Render Active Lines (Defensive Line) */}
          {defensiveLine.visible && (
            <div 
              onMouseDown={handlePitchStart}
              onTouchStart={handlePitchStart}
              className="absolute left-0 right-0 h-1 bg-red-500/80 cursor-ns-resize flex items-center justify-center z-20 group touch-none"
              style={{ top: `${defensiveLine.y}%` }}
            >
              <span className="text-[10px] font-mono bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-900/50 absolute select-none opacity-80 group-hover:opacity-100 transition shadow">
                DEFENSIVE LINE - Drag to set height ({Math.round(100 - defensiveLine.y)}m)
              </span>
            </div>
          )}

          {/* Render Pressing Zones */}
          {zones.map((zn) => {
            const isSelected = selectedElement?.type === "zone" && selectedElement?.id === zn.id;
            return (
              <div
                key={zn.id}
                onMouseDown={handlePitchStart}
                onTouchStart={handlePitchStart}
                className={`absolute bg-orange-500/15 border rounded flex items-center justify-center cursor-move group z-10 hover:bg-orange-500/25 transition shadow-inner touch-none ${
                  isSelected 
                    ? "border-emerald-400 ring-2 ring-emerald-500/80 bg-orange-500/25 border-solid" 
                    : "border-dashed border-orange-500/40"
                }`}
                style={{
                  left: `${zn.x}%`,
                  top: `${zn.y}%`,
                  width: `${zn.width}%`,
                  height: `${zn.height}%`,
                }}
              >
                <button
                  onClick={() => handleDeleteElement(zn.id, "zone")}
                  className="absolute -top-2.5 -right-2.5 p-1 bg-gray-900 hover:bg-red-950 border border-gray-800 rounded-full text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="text-[9px] font-mono text-orange-400 font-semibold select-none">
                  Pressing Zone
                </span>
              </div>
            );
          })}

          {/* Render Text Labels */}
          {labels.map((lbl) => {
            const isSelected = selectedElement?.type === "label" && selectedElement?.id === lbl.id;
            return (
              <div
                key={lbl.id}
                onMouseDown={handlePitchStart}
                onTouchStart={handlePitchStart}
                className={`absolute bg-gray-950/90 border text-gray-200 px-2.5 py-1 rounded text-xs font-semibold cursor-move select-none group flex items-center gap-1.5 shadow-lg z-20 touch-none ${
                  isSelected ? "border-emerald-500 ring-2 ring-emerald-500/80" : "border-gray-800"
                }`}
                style={{
                  left: `${lbl.x}%`,
                  top: `${lbl.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <span>{lbl.text}</span>
                <button
                  onClick={() => handleDeleteElement(lbl.id, "label")}
                  className="p-0.5 hover:text-red-400 text-gray-500 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Render Passing & Tactical Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
            <defs>
              <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
              <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>

            {/* Visual Movement Trails for realistic player movement between phases */}
            {(() => {
              const currentPhaseIndex = boardTactic.phases.findIndex(ph => ph.id === boardTactic.activePhaseId);
              const previousPhase = currentPhaseIndex > 0 ? boardTactic.phases[currentPhaseIndex - 1] : null;

              if (!previousPhase) return null;

              return players.map((p) => {
                const prevPlayer = previousPhase.canvasData.players.find(px => px.id === p.id);
                if (!prevPlayer) return null;

                const distance = Math.hypot(p.x - prevPlayer.x, p.y - prevPlayer.y);
                if (distance < 2.5) return null; // only show if player shifted significantly

                const startX = `${prevPlayer.x}%`;
                const startY = `${prevPlayer.y}%`;
                const endX = `${p.x}%`;
                const endY = `${p.y}%`;

                return (
                  <g key={`trail-${p.id}`} className="opacity-35 hover:opacity-75 transition-opacity">
                    {/* Starting position shadow ghost dot */}
                    <circle cx={startX} cy={startY} r="4" fill="#3b82f6" fillOpacity="0.4" stroke="#2563eb" strokeWidth="1" />
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      markerEnd="url(#arrowhead-blue)"
                    />
                    {/* Running length label in meters */}
                    <text
                      x={`${(prevPlayer.x + p.x) / 2}%`}
                      y={`${(prevPlayer.y + p.y) / 2 - 2.5}%`}
                      fill="#93c5fd"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {Math.round(distance * 1.05)}m run
                    </text>
                  </g>
                );
              });
            })()}

            {arrows.map((arr) => {
              const fromPlayer = players.find(p => p.id === arr.fromId);
              if (!fromPlayer) return null;
              
              const startX = `${fromPlayer.x}%`;
              const startY = `${fromPlayer.y}%`;
              const endX = `${arr.toX}%`;
              const endY = `${arr.toY}%`;

              const strokeColor = arr.color === "green" ? "#10b981" : arr.color === "blue" ? "#3b82f6" : "#ef4444";
              const strokeDash = arr.type === "pass" ? "5,5" : "none";

              return (
                <g key={arr.id} className="group pointer-events-auto cursor-pointer" onClick={() => handleDeleteElement(arr.id, "arrow")}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={strokeColor}
                    strokeWidth="3.5"
                    strokeDasharray={strokeDash}
                    markerEnd={`url(#arrowhead-${arr.color})`}
                    className="hover:stroke-red-500 transition-colors"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Active Player Markers */}
          {players.map((p) => {
            const isDefender = p.role === "DEF";
            const isGK = p.role === "GK";
            const isMid = p.role === "MID";
            
            let bubbleBg = "bg-emerald-500 border-white text-gray-950"; // Standard green for midfield
            if (isDefender) bubbleBg = "bg-indigo-600 border-white text-white";
            if (isGK) bubbleBg = "bg-amber-500 border-white text-gray-950";
            if (p.role === "ATT") bubbleBg = "bg-rose-500 border-white text-white";

            const isSelected = selectedElement?.type === "player" && selectedElement?.id === p.id;
            const isDragging = p.id === draggingPlayerId;

            return (
              <motion.div
                key={p.id}
                onMouseDown={handlePitchStart}
                onTouchStart={handlePitchStart}
                className="absolute select-none cursor-move z-30 touch-none"
                style={{
                  transform: "translate(-50%, -50%)"
                }}
                animate={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                }}
                transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
              >
                {/* Visual player circular node - enlarged for mobile thumb friendliness */}
                <div 
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full border-2 flex flex-col items-center justify-center font-bold text-sm sm:text-xs shadow-lg relative select-none ${bubbleBg} ${
                    isSelected ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-gray-950 scale-105" : ""
                  }`}
                >
                  <span>{p.number}</span>
                  {/* Position badge inside player circle */}
                  <span className="absolute -top-2.5 bg-gray-900 border border-gray-700 text-gray-300 text-[8px] font-mono px-1 rounded scale-90 select-none">
                    {p.positionName}
                  </span>
                  
                  {/* Quick Add arrow controller */}
                  {activeTool === "arrow" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddArrowFromPlayer(p.id);
                      }}
                      className="absolute -right-2 -bottom-2 p-1 bg-gray-900 hover:bg-emerald-600 rounded-full border border-gray-800 text-emerald-400 hover:text-white pointer-events-auto shadow cursor-pointer"
                      title="Draw tactical arrow from this player"
                    >
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                {/* Player human name */}
                <span className="block text-[10px] text-center font-semibold text-white drop-shadow-md whitespace-nowrap bg-gray-950/80 px-1 py-0.5 rounded border border-gray-900/40 mt-1 select-none">
                  {p.name}
                </span>
              </motion.div>
            );
          })}
          </div>
        </div>

        {/* Dynamic 8-Second Idle Nudge Box */}
        {showIdleNudge && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-lg p-3 shadow-xl mb-1 flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-900 rounded-full">💡</span>
              <p className="text-xs">
                Coach Marcus: "This striker Haaland looks isolated. Want a recommendation?"
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleApplySuggestion}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs rounded transition font-bold cursor-pointer"
              >
                Apply (False 9)
              </button>
              <button
                onClick={() => setShowIdleNudge(false)}
                className="px-2 py-1 text-emerald-500 hover:text-emerald-400 text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Pitch Instructions Helper */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-900/30 p-2.5 rounded border border-gray-900">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Pitch: Drag players, add press zones, customize defense lines. Switch slides to plan phases.</span>
          </span>
          <span className="font-mono text-gray-600 text-[10px]">COORDINATE RANGE: 0 - 100</span>
        </div>
      </div>

      {/* RIGHT AI COACH SIDEBAR PANEL */}
      <div className={`w-full lg:w-96 border-l border-gray-900 flex flex-col justify-between bg-gray-950 shrink-0 h-full lg:h-full ${mobileTab === "coach" ? "flex" : "hidden lg:flex"}`}>
        <div className="p-4 border-b border-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">Match Brain Assistant</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
            CONTEXT-AWARE AI
          </span>
        </div>

        {/* Messages list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {aiChat.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] font-mono text-gray-500 mb-1">
                {msg.sender === "user" ? "You" : "TactIQ Coach"}
              </span>
              <div 
                className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] shadow-md border ${
                  msg.sender === "user" 
                    ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-200" 
                    : "bg-gray-900 border-gray-850 text-gray-300"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loadingAi && (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-1 font-mono">
              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing board layout and generating advice...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion chips */}
        <div className="px-3 pt-3 pb-2 border-t border-gray-900/60 bg-gray-950/60">
          <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider mb-2">
            Quick Prompts — tap to ask
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Analyze midfield shape",   prompt: "Analyze my current midfield shape and identify space vulnerabilities." },
              { label: "Compare defense line",     prompt: "How does my defensive line height compare to a 4-3-3 high block?" },
              { label: "Striker movement tips",    prompt: "How can my striker make better runs to stay involved and beat the offside trap?" },
              { label: "Counter-attack options",   prompt: "What counter-attack triggers should my team look for from this formation?" },
              { label: "Press trigger zones",      prompt: "Where are the best press trigger zones on the pitch given my formation?" },
              { label: "Fix wide overloads",       prompt: "My wide players are getting overloaded defensively. What adjustments do you suggest?" },
              { label: "Set piece routine idea",   prompt: "Suggest a corner kick routine that exploits a back-post overload." },
            ].map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => handleSendChat(prompt)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-gray-900 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-800/60 text-gray-300 cursor-pointer border border-gray-800 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Free-form chat input */}
        <div className="p-3 border-t border-gray-900 bg-gray-950">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-2">
            Ask anything
          </p>
          <div className="flex gap-2">
            <input
              id="input-coach-chat"
              type="text"
              placeholder="e.g. Why is my striker getting isolated?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loadingAi && handleSendChat()}
              className="flex-1 min-w-0 bg-gray-900 border border-gray-800 focus:border-emerald-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-white placeholder:text-gray-600 transition-colors"
            />
            <button
              id="btn-send-coach-chat"
              onClick={() => handleSendChat()}
              disabled={loadingAi || !chatInput.trim()}
              aria-label="Send message to AI coach"
              className="shrink-0 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition cursor-pointer shadow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
