import { useState, useEffect } from "react";
import { Tactic, FootballMatch, TrainingSession, Player } from "./types";
import Sidebar from "./components/Sidebar";
import HomeDashboard from "./components/HomeDashboard";
import TacticsBoard, { FORMATION_COORDINATES } from "./components/TacticsBoard";
import MatchSimulator from "./components/MatchSimulator";
import TeamWorkspace from "./components/TeamWorkspace";
import ExploreCommunity from "./components/ExploreCommunity";
import { ToastProvider } from "./components/Toast";

const INITIAL_SQUAD: Player[] = [
  { id: "player-1", name: "Ederson", number: 1, role: "GK", positionName: "GK", x: 50, y: 92 },
  { id: "player-2", name: "Rúben Dias", number: 3, role: "DEF", positionName: "CB", x: 38, y: 78 },
  { id: "player-3", name: "John Stones", number: 5, role: "DEF", positionName: "CB", x: 62, y: 78 },
  { id: "player-4", name: "Josko Gvardiol", number: 24, role: "DEF", positionName: "LB", x: 15, y: 68 },
  { id: "player-5", name: "Kyle Walker", number: 2, role: "DEF", positionName: "RB", x: 85, y: 68 },
  { id: "player-6", name: "Rodri", number: 16, role: "MID", positionName: "DM", x: 50, y: 58 },
  { id: "player-7", name: "Kevin De Bruyne", number: 17, role: "MID", positionName: "CM", x: 33, y: 46 },
  { id: "player-8", name: "Bernardo Silva", number: 20, role: "MID", positionName: "CM", x: 67, y: 46 },
  { id: "player-9", name: "Jack Grealish", number: 10, role: "ATT", positionName: "LW", x: 20, y: 26 },
  { id: "player-10", name: "Phil Foden", number: 47, role: "ATT", positionName: "RW", x: 80, y: 26 },
  { id: "player-11", name: "Erling Haaland", number: 9, role: "ATT", positionName: "ST", x: 50, y: 20 },
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");

  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [squadPlayers, setSquadPlayers] = useState<Player[]>([]);

  const [streakDays, setStreakDays] = useState<number>(5);
  const [tacticalRating, setTacticalRating] = useState<number>(847);
  const [isPro, setIsPro] = useState<boolean>(false);

  const [activeTacticId, setActiveTacticId] = useState<string | null>(null);

  useEffect(() => {
    const cachedTactics = localStorage.getItem("tactiq_tactics");
    const cachedMatches = localStorage.getItem("tactiq_matches");
    const cachedSessions = localStorage.getItem("tactiq_sessions");
    const cachedPlayers = localStorage.getItem("tactiq_players");
    const cachedStreak = localStorage.getItem("tactiq_streak");
    const cachedRating = localStorage.getItem("tactiq_rating");
    const cachedPro = localStorage.getItem("tactiq_pro");

    if (cachedStreak) setStreakDays(parseInt(cachedStreak) || 5);
    if (cachedRating) setTacticalRating(parseInt(cachedRating) || 847);
    if (cachedPro) setIsPro(cachedPro === "true");

    if (cachedTactics) {
      setTactics(JSON.parse(cachedTactics));
    } else {
      const defaultSeedTactics: Tactic[] = [
        {
          id: "seed-t-1",
          title: "4-3-3 High Pressing Shape",
          formation: "4-3-3",
          phases: [
            {
              id: "p-bu-1",
              name: "Build-up",
              canvasData: {
                players: INITIAL_SQUAD,
                arrows: [],
                zones: [{ id: "z-1", x: 35, y: 35, width: 30, height: 20, type: "rectangle" }],
                defensiveLine: { y: 72, visible: true },
                labels: [{ id: "l-1", text: "Maintain high press block", x: 35, y: 60 }]
              }
            }
          ],
          activePhaseId: "p-bu-1",
          styleTags: ["Press", "Attack"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "seed-t-2",
          title: "3-5-2 Compact Defensive Shifting",
          formation: "3-5-2",
          phases: [
            {
              id: "p-bu-2",
              name: "Defence",
              canvasData: {
                players: FORMATION_COORDINATES["3-5-2"].map((p, idx) => ({
                  id: `player-${idx + 1}`,
                  name: p.name,
                  number: idx + 1,
                  role: p.role,
                  positionName: p.pos,
                  x: p.x,
                  y: p.y
                })),
                arrows: [],
                zones: [],
                defensiveLine: { y: 80, visible: true },
                labels: [{ id: "l-2", text: "Squeeze central spaces", x: 50, y: 75 }]
              }
            }
          ],
          activePhaseId: "p-bu-2",
          styleTags: ["Compact", "Possession"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTactics(defaultSeedTactics);
      localStorage.setItem("tactiq_tactics", JSON.stringify(defaultSeedTactics));
    }

    if (cachedMatches) {
      setMatches(JSON.parse(cachedMatches));
    } else {
      const defaultSeedMatch: FootballMatch[] = [
        {
          id: "seed-m-1",
          opponentName: "Riverside FC",
          date: "Saturday, June 27, 2026",
          scoreHome: 1,
          scoreAway: 2,
          formationUsed: "4-3-3",
          coachNotes: "Exposed twice on the right channel due to fullbacks moving high without midfield covering the transition."
        }
      ];
      setMatches(defaultSeedMatch);
      localStorage.setItem("tactiq_matches", JSON.stringify(defaultSeedMatch));
    }

    if (cachedPlayers) {
      setSquadPlayers(JSON.parse(cachedPlayers));
    } else {
      setSquadPlayers(INITIAL_SQUAD);
      localStorage.setItem("tactiq_players", JSON.stringify(INITIAL_SQUAD));
    }

    if (cachedSessions) {
      setTrainingSessions(JSON.parse(cachedSessions));
    }
  }, []);

  const handleSaveTactics = (updatedList: Tactic[]) => {
    setTactics(updatedList);
    localStorage.setItem("tactiq_tactics", JSON.stringify(updatedList));
    handleIncrementPoints(15);
  };

  const handleSaveMatches = (updatedList: FootballMatch[]) => {
    setMatches(updatedList);
    localStorage.setItem("tactiq_matches", JSON.stringify(updatedList));
    handleIncrementPoints(30);
  };

  const handleSaveSessions = (updatedList: TrainingSession[]) => {
    setTrainingSessions(updatedList);
    localStorage.setItem("tactiq_sessions", JSON.stringify(updatedList));
    handleIncrementPoints(25);
  };

  const handleSavePlayers = (updatedList: Player[]) => {
    setSquadPlayers(updatedList);
    localStorage.setItem("tactiq_players", JSON.stringify(updatedList));
  };

  const handleIncrementPoints = (pts: number) => {
    setTacticalRating(prev => {
      const next = prev + pts;
      localStorage.setItem("tactiq_rating", next.toString());
      return next;
    });
  };

  const handleSelectTactic = (tacticId: string) => {
    setActiveTacticId(tacticId);
    setCurrentView("board");
  };

  const handleNewTactic = (formationOverride?: string) => {
    const formation = formationOverride || "4-3-3";
    const newId = "tactic-" + Date.now();
    const defaultPhase = {
      id: "phase-" + Date.now(),
      name: "Build-up",
      canvasData: {
        players: FORMATION_COORDINATES[formation].map((p, i) => ({
          id: `player-${i + 1}`,
          name: p.name,
          number: i + 1 === 1 ? 1 : i + 8,
          role: p.role,
          positionName: p.pos,
          x: p.x,
          y: p.y
        })),
        arrows: [],
        zones: [],
        defensiveLine: { y: 75, visible: true },
        labels: []
      }
    };

    const newTactic: Tactic = {
      id: newId,
      title: `My New ${formation} Plan`,
      formation,
      phases: [defaultPhase],
      activePhaseId: defaultPhase.id,
      styleTags: ["Custom"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newTactic, ...tactics];
    handleSaveTactics(updated);
    setActiveTacticId(newId);
    setCurrentView("board");
  };

  const handleStartWeeklyChallenge = () => {
    const challengePlayers = FORMATION_COORDINATES["4-3-3"]
      .slice(0, 9)
      .map((p, idx) => ({
        id: `challenge-player-${idx + 1}`,
        name: idx === 0 ? "Ederson (GK)" : `Outfield-${idx}`,
        number: idx === 0 ? 1 : idx + 4,
        role: p.role,
        positionName: p.pos,
        x: p.x,
        y: p.y
      }));

    const challengePhase = {
      id: "challenge-phase",
      name: "Challenge Build-up",
      canvasData: {
        players: challengePlayers,
        arrows: [],
        zones: [{ id: "z-challenge", x: 30, y: 25, width: 40, height: 25, type: "rectangle" as const }],
        defensiveLine: { y: 65, visible: true },
        labels: [{ id: "l-challenge", text: "8 OUTFIELD CHALLENGE: Beat high press lines!", x: 30, y: 15 }]
      }
    };

    const challengeTactic: Tactic = {
      id: "challenge-weekly",
      title: "Weekly Puzzle: Beat Press with 8",
      formation: "4-3-3",
      phases: [challengePhase],
      activePhaseId: challengePhase.id,
      styleTags: ["Challenge"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [challengeTactic, ...tactics.filter(t => t.id !== "challenge-weekly")];
    handleSaveTactics(updated);
    setActiveTacticId("challenge-weekly");
    setCurrentView("board");
  };

  const activeTacticObj = tactics.find(t => t.id === activeTacticId) || null;

  return (
    <ToastProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 font-sans text-gray-200">
      {currentView !== "board" && (
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view !== "board") {
              setActiveTacticId(null);
            }
          }}
          isPro={isPro}
          onTogglePro={() => {
            const next = !isPro;
            setIsPro(next);
            localStorage.setItem("tactiq_pro", next.toString());
          }}
        />
      )}

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 h-full">
        {currentView === "home" && (
          <HomeDashboard
            tactics={tactics}
            matches={matches}
            streakDays={streakDays}
            tacticalRating={tacticalRating}
            onSelectTactic={handleSelectTactic}
            onNewTactic={handleNewTactic}
            onNavigate={setCurrentView}
            onStartChallenge={handleStartWeeklyChallenge}
          />
        )}

        {currentView === "board" && (
          <TacticsBoard
            tactic={activeTacticObj}
            onSaveTactic={(updatedTactic) => {
              const list = tactics.map(t => t.id === updatedTactic.id ? updatedTactic : t);
              if (!tactics.find(t => t.id === updatedTactic.id)) {
                list.unshift(updatedTactic);
              }
              handleSaveTactics(list);
            }}
            onBackToDashboard={() => {
              setActiveTacticId(null);
              setCurrentView("home");
            }}
          />
        )}

        {currentView === "simulator" && (
          <MatchSimulator />
        )}

        {currentView === "team" && (
          <TeamWorkspace
            players={squadPlayers}
            matches={matches}
            trainingSessions={trainingSessions}
            onAddPlayer={(p) => handleSavePlayers([p, ...squadPlayers])}
            onDeletePlayer={(id) => handleSavePlayers(squadPlayers.filter(p => p.id !== id))}
            onUpdatePlayer={(p) => handleSavePlayers(squadPlayers.map(prev => prev.id === p.id ? p : prev))}
            onAddMatch={(m) => handleSaveMatches([m, ...matches])}
            onAddTrainingSession={(s) => handleSaveSessions([s, ...trainingSessions])}
          />
        )}

        {currentView === "explore" && (
          <ExploreCommunity
            onStartChallenge={handleStartWeeklyChallenge}
            onNewTactic={handleNewTactic}
          />
        )}
      </main>
    </div>
    </ToastProvider>
  );
}
