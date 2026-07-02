export type UserRole = "coach" | "player" | "fan" | "admin";
export type UserPlan = "free" | "pro" | "team" | "school";

export interface Player {
  id: string;
  name: string;
  number: number;
  role: "GK" | "DEF" | "MID" | "ATT";
  positionName: string;
  x: number;
  y: number;
  speed?: number;
  passing?: number;
  positioning?: number;
  defending?: number;
  shooting?: number;
  stamina?: number;
}

export interface TacticalArrow {
  id: string;
  fromId: string;
  toX: number;
  toY: number;
  type: "pass" | "run" | "press";
  color: "green" | "blue" | "red";
}

export interface PressZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "circle" | "rectangle";
}

export interface DefensiveLine {
  y: number;
  visible: boolean;
}

export interface TextLabel {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface CanvasData {
  players: Player[];
  arrows: TacticalArrow[];
  zones: PressZone[];
  defensiveLine: DefensiveLine;
  labels: TextLabel[];
}

export interface TacticPhase {
  id: string;
  name: "Build-up" | "Attack" | "Defence" | string;
  canvasData: CanvasData;
}

export interface Tactic {
  id: string;
  title: string;
  formation: string;
  phases: TacticPhase[];
  activePhaseId: string;
  styleTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FootballMatch {
  id: string;
  opponentName: string;
  date: string;
  scoreHome: number;
  scoreAway: number;
  formationUsed: string;
  coachNotes: string;
  aiDebrief?: string;
}

export interface SessionDrill {
  name: string;
  duration: number;
  description: string;
  coachingCues: string[];
  equipment: string[];
}

export interface TrainingSession {
  id: string;
  goalText: string;
  durationMins: number;
  playerCount: number;
  drills: SessionDrill[];
  createdAt: string;
}

export interface MatchSimulationInput {
  homeFormation: string;
  awayFormation: string;
  homeStyle: "Press" | "Possession" | "Counter" | "Low Block";
  awayStyle: "Press" | "Possession" | "Counter" | "Low Block";
  homeAdvantage: "Even" | "Home" | "Away";
  missingPlayer: boolean;
}

export interface SimulationResult {
  possessionHome: number;
  possessionAway: number;
  pressSuccessHome: number;
  pressSuccessAway: number;
  spaceInFinalThird: "Low" | "Medium" | "High";
  vulnerableZones: {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    description: string;
  }[];
  aiNarrative: string;
  suggestedAdjustment: string;
}

export interface CoachMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
