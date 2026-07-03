import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

interface SimStats {
  possessionHome: number;
  possessionAway: number;
  pressSuccessHome: number;
  pressSuccessAway: number;
  spaceInFinalThird: "Low" | "Medium" | "High";
  vulnerableZones: { name: string; description: string; x: number; y: number; width: number; height: number }[];
}

function runTacticalSimulation(
  homeForm: string,
  awayForm: string,
  homeStyle: string,
  awayStyle: string,
  homeAdvantage: string
): SimStats {
  let posH = 50;
  let pressH = 50;
  let pressA = 50;
  let spaceThird: "Low" | "Medium" | "High" = "Medium";
  const zones: SimStats["vulnerableZones"] = [];

  if (homeForm === "3-5-2" && awayForm === "4-3-3") {
    posH += 5;
    zones.push({ name: "Wide Flanks (Behind Wingbacks)", description: "Away wingers can exploit spaces behind wingbacks on quick transition.", x: 10, y: 35, width: 15, height: 30 });
  } else if (homeForm === "4-3-3" && awayForm === "3-5-2") {
    posH -= 5;
    zones.push({ name: "Half-spaces", description: "Away dual strikers and advanced midfielders can overload the channel between fullback and centerback.", x: 25, y: 40, width: 20, height: 20 });
  }
  if (homeForm === "4-2-3-1" && awayForm === "4-4-2") { posH += 8; }
  else if (homeForm === "4-4-2" && awayForm === "4-2-3-1") { posH -= 8; }

  if (homeStyle === "Possession") posH += 10;
  if (awayStyle === "Possession") posH -= 10;
  if (homeStyle === "Press") {
    pressH += 15;
    if (awayStyle === "Possession") { posH -= 5; pressH += 5; }
  }
  if (awayStyle === "Press") {
    pressA += 15;
    if (homeStyle === "Possession") { posH += 5; pressA += 5; }
  }
  if (homeStyle === "Low Block") {
    posH -= 12; spaceThird = "Low";
    zones.push({ name: "Deep Box", description: "Congested center of the box makes central entries difficult.", x: 35, y: 75, width: 30, height: 15 });
  }
  if (awayStyle === "Low Block") {
    posH += 12; spaceThird = "Low";
    zones.push({ name: "Opponent Low Block Core", description: "Squeeze central lanes. Requires shifting ball side-to-side to create gaps.", x: 35, y: 15, width: 30, height: 15 });
  }
  if (homeAdvantage === "Home") { posH += 3; pressH += 5; }
  else if (homeAdvantage === "Away") { posH -= 3; pressA += 5; }

  posH = Math.max(15, Math.min(85, posH));
  pressH = Math.max(20, Math.min(90, pressH));
  pressA = Math.max(20, Math.min(90, pressA));

  if (zones.length === 0) {
    zones.push({ name: "Midfield Pocket", description: "Zone of active transition and turnovers.", x: 40, y: 45, width: 20, height: 15 });
  }

  return { possessionHome: posH, possessionAway: 100 - posH, pressSuccessHome: pressH, pressSuccessAway: pressA, spaceInFinalThird: spaceThird, vulnerableZones: zones };
}

// 1. AI Coach endpoint
router.post("/gemini/coach", async (req, res) => {
  const { activeTactic, currentPhase, prompt } = req.body;
  const formation = activeTactic?.formation || "4-3-3";
  const title = activeTactic?.title || "Untitled Tactic";
  const phaseName = currentPhase?.name || "Attack";
  const userPrompt = prompt || "Analyze my current formation and give a suggestion.";

  const fallbacks = [
    `TactIQ Coach: For your ${formation} in the ${phaseName} phase, ensure your central pivot players are positioned defensively to prevent quick counters. If the opposition plays a low block, encourage fullbacks to push high and offer width to stretch their compact lines. Shall we add a high press zone on the board?`,
    `TactIQ Coach: Looking at "${title}" (${formation}) during ${phaseName}, my top recommendation is to ensure wingers and advanced midfielders coordinate to create overloads in the half-spaces. Keep the defensive line high to compress space between the lines. How would you like to tweak the pressing zone?`,
    `TactIQ Coach: On this ${formation} setup for "${title}", the defensive line height is critical during the ${phaseName} phase. Ensure central defenders drop quickly if the opponent bypasses your first line of press. Adjust player roles or rename note labels to make instructions clearer?`
  ];
  const getDynamicLocal = () => fallbacks[Math.abs(userPrompt.length) % fallbacks.length];

  const ai = getGeminiClient();
  if (!ai) {
    res.json({ text: getDynamicLocal() });
    return;
  }

  try {
    const systemInstruction = `You are TactIQ AI, an elite professional football tactics coach and senior match analyst. You speak directly, constructively, and specifically. Never give vague, generic advice. Strictly enforce a MAXIMUM limit of 120 words. Always end with exactly one direct, actionable prompt/question to guide the coach to their next tactical move. Context: Tactic "${title}", Formation: "${formation}", Phase: "${phaseName}". Use this context to address the user's inquiry.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.7 },
    });
    res.json({ text: response.text });
  } catch {
    res.json({ text: getDynamicLocal() });
  }
});

// 2. AI Match Simulator endpoint
router.post("/gemini/simulate", async (req, res) => {
  const { homeFormation, awayFormation, homeStyle, awayStyle, homeAdvantage, missingPlayer } = req.body;
  const stats = runTacticalSimulation(homeFormation, awayFormation, homeStyle, awayStyle, homeAdvantage);

  const getDynamicLocal = () => {
    let narrative = `A captivating matchup unfolds as the home side deploys a ${homeFormation} (${homeStyle}) against the away team's ${awayFormation} (${awayStyle}). `;
    if (homeStyle === "Press" && awayStyle === "Possession") {
      narrative += `The home team's intense high-press block successfully disrupted the away team's patient build-up, forcing turnovers in key transition sectors with a ${stats.pressSuccessHome}% pressing success rate. `;
    } else if (homeStyle === "Possession" && awayStyle === "Press") {
      narrative += `Home's patient positional game with ${stats.possessionHome}% ball possession forced Away's pressing structures to shift constantly, opening pockets of space in the half-spaces and wide channels. `;
    } else {
      narrative += `Midfield duels dominated the flow, with Home maintaining ${stats.possessionHome}% possession while searching for gaps to exploit between the opponent's defensive lines. `;
    }
    if (missingPlayer) narrative += `The suspension of the home team's key player noticeably slowed down fluid transitions. `;
    const adjustments: Record<string, string> = {
      Possession: "Instruct fullbacks to overlap dynamically to stretch the opponent's defensive shape.",
      Press: "Establish a structured mid-block resting shape during phases of low stamina.",
      "Low Block": "Release quick winger runs immediately upon winning possession.",
    };
    return { stats, aiNarrative: narrative.trim() + " [TactIQ Local Engine]", suggestedAdjustment: adjustments[homeStyle] || "Consider shifting to a 4-2-3-1 double pivot layout." };
  };

  const ai = getGeminiClient();
  if (!ai) {
    res.json(getDynamicLocal());
    return;
  }

  try {
    const systemInstruction = `You are TactIQ AI, a world-class football tactical simulator. Based on raw computed stats, formations, and styles, write an elite tactical narrative explaining precisely WHY the matchup results in these stats. Use clear tactical concepts (overloads, transition traps, positional play, half-spaces). Strictly keep the narrative around 120 words. Do not hallucinate random stats; stick to the provided simulation statistics. Also provide 1 specific, highly targeted tactical adjustment the Home manager could execute.`;
    const prompt = `Matchup:\nHome: ${homeFormation} playing "${homeStyle}".\nAway: ${awayFormation} playing "${awayStyle}".\nAdvantage: ${homeAdvantage}. Key player absence: ${missingPlayer ? "Yes" : "No"}.\n\nStats:\n- Possession: ${stats.possessionHome}% Home / ${stats.possessionAway}% Away\n- Press success: ${stats.pressSuccessHome}% Home / ${stats.pressSuccessAway}% Away\n- Space in Final Third: "${stats.spaceInFinalThird}"\n\nReturn JSON: {"aiNarrative": "...", "suggestedAdjustment": "..."}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiNarrative: { type: Type.STRING },
            suggestedAdjustment: { type: Type.STRING },
          },
          required: ["aiNarrative", "suggestedAdjustment"],
        },
        temperature: 0.6,
      },
    });
    const result = JSON.parse(response.text?.trim() || "{}");
    res.json({ stats, aiNarrative: result.aiNarrative, suggestedAdjustment: result.suggestedAdjustment });
  } catch {
    res.json(getDynamicLocal());
  }
});

// 3. AI Training Session Builder endpoint
router.post("/gemini/training", async (req, res) => {
  const { goalText, durationMins, playerCount } = req.body;

  const getDynamicLocal = () => ({
    goalText, durationMins, playerCount,
    drills: [
      {
        name: "Warm-up: Rondo 4v2 Passing",
        duration: Math.round(durationMins * 0.2),
        description: `Passing triangles inside a compact rondo grid to activate rapid transition triggers and spatial awareness, targeting: "${goalText}".`,
        coachingCues: ["Limit touches to 1 or 2", "Open body posture to scan surroundings", "Apply quick press upon possession loss"],
        equipment: ["4 Cones", "1 Match Ball", "2 Training Bibs"],
      },
      {
        name: "Core Theme: Tactical Positioning & Progression",
        duration: Math.round(durationMins * 0.5),
        description: `Structured transition play from the defensive third into wide channels to unlock space in the final third. Addresses: "${goalText}".`,
        coachingCues: ["Wingers commit defenders to free up overlapping options", "Midfield pivot maintains balance", "Precise delivery into the penalty box"],
        equipment: ["10 Cones", "5 Training Balls", "2 Portable Goals"],
      },
      {
        name: "Match Scenario: Scrimmage with Restrictions",
        duration: Math.round(durationMins * 0.3),
        description: `Full scrimmage where goals are doubled if scored within 5 passes of winning possession, matching: "${goalText}".`,
        coachingCues: ["Defensive units squeeze vertical lanes", "Deliver instant forward outlet passes", "Patience when in established possession"],
        equipment: ["Cones", "Bibs", "Balls", "Goals"],
      },
    ],
  });

  const ai = getGeminiClient();
  if (!ai) {
    res.json(getDynamicLocal());
    return;
  }

  try {
    const systemInstruction = `You are TactIQ AI, an elite UEFA Pro license coaching educator. Generate an outstanding, professional, structured football training session plan. Generate a sequence of 3 highly logical drills: 1. Warm-up (20% duration), 2. Technical/Tactical Theme Drill (50% duration), 3. Conditioned Scrimmage (30% duration). Each drill must include a professional name, precise duration (minutes), specific setup description, actionable coaching cues, and required training equipment. Format as clean structured JSON.`;
    const prompt = `Build a coaching session plan for:\n- Goal: "${goalText}"\n- Total Duration: ${durationMins} minutes\n- Available Squad: ${playerCount} players.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  coachingCues: { type: Type.ARRAY, items: { type: Type.STRING } },
                  equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "duration", "description", "coachingCues", "equipment"],
              },
            },
          },
          required: ["drills"],
        },
        temperature: 0.7,
      },
    });
    const result = JSON.parse(response.text?.trim() || "{}");
    res.json({ goalText, durationMins, playerCount, drills: result.drills });
  } catch {
    res.json(getDynamicLocal());
  }
});

// 4. Match Brain Insights endpoint
router.post("/gemini/insights", async (req, res) => {
  const { matches } = req.body;

  const getDynamicLocal = () => {
    if (!matches || matches.length === 0) {
      return { insight: "Log your first weekend match to unlock personalized Match Brain insights! Your AI assistant will detect conceding channels and style flaws.", drillSuggestion: "Rondo 5v2 transition drill." };
    }
    let totalGoalsConceded = 0;
    let totalGoalsScored = 0;
    let notesText = "";
    matches.forEach((m: { scoreAway?: number; scoreHome?: number; coachNotes?: string }) => {
      totalGoalsConceded += m.scoreAway || 0;
      totalGoalsScored += m.scoreHome || 0;
      if (m.coachNotes) notesText += " " + m.coachNotes;
    });
    const formation = matches[0].formationUsed || "4-3-3";
    if (totalGoalsConceded > totalGoalsScored) {
      return { insight: `Our analysis of your last ${matches.length} matches shows defensive lapses. Your ${formation} layout has conceded ${totalGoalsConceded} goals, frequently leaving the defensive lines isolated during direct transitions. Instruct fullbacks to delay opponent counters.`, drillSuggestion: "Overload Channel Defensive Recovery Grid" };
    } else if (notesText.toLowerCase().includes("press") || notesText.toLowerCase().includes("trap")) {
      return { insight: "Excellent pressing records. Your tactical logs indicate highly coordinated defensive traps that successfully force opponent turnovers. Focus now on rapid vertical transition passes to punish unbalanced defensive lines.", drillSuggestion: "Midfield Turnover Rapid Counter-Press Rondo" };
    }
    return { insight: `Your team displays solid control in central areas using the ${formation} structure. However, building out under a high opponent press remains an area to perfect. Ensure defensive pivots drop deeper to offer passing angles.`, drillSuggestion: "Building out from the Back under High Press" };
  };

  const ai = getGeminiClient();
  if (!ai) {
    res.json(getDynamicLocal());
    return;
  }

  try {
    const matchSummary = matches
      .map((m: { opponentName: string; scoreHome: number; scoreAway: number; formationUsed: string; coachNotes: string }) =>
        `vs ${m.opponentName}: Score ${m.scoreHome}-${m.scoreAway}, Formation: ${m.formationUsed}, Notes: ${m.coachNotes}`)
      .join("\n");
    const systemInstruction = `You are Match Brain, a professional analytics companion for grassroots and semi-pro football coaches. Analyze the logged match history list and produce one highly targeted, personalized tactical observation (Today's Insight) directly tied to the match events, formations, or coach notes. Give actionable, elite coaching advice in a maximum of 90 words. Always recommend a single training drill name or theme to address this specific observation.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this logged match history:\n${matchSummary}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            drillSuggestion: { type: Type.STRING },
          },
          required: ["insight", "drillSuggestion"],
        },
        temperature: 0.6,
      },
    });
    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch {
    res.json(getDynamicLocal());
  }
});

export default router;
