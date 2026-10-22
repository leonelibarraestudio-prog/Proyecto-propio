export interface LiveEventsHeroRefApi {
  id: string;
  name: string | null;
}

export interface LiveEventsNarrativeLineApi {
  lineSequence: number;
  type: string;
  speaker: LiveEventsHeroRefApi | null;
  text: string;
}

export interface LiveEventApi {
  sequence: number;
  turn: number;
  phase: string;
  eventCode: string;
  actor: LiveEventsHeroRefApi | null;
  targets: LiveEventsHeroRefApi[];
  targetSideCode: string | null;
  actionName: string | null;
  actionCode: string | null;
  damage: number | null;
  amount: number | null;
  apChange: number | null;
  abilityPoints: number | null;
  energy: number | null;
  strategyCode: string | null;
  lines: LiveEventsNarrativeLineApi[];
  targetTeamSide: string | null;
  statCode: string | null;
  percent: number | null;
  duration: number | null;
}

export interface LiveEventsFinalStageApi {
  status: string;
  phase: string;
  phaseLabel: string;
  normalTurn: number;
  turnState: string;
  completed: boolean;
  outcomeCode: string | null;
  playerTeamId: string;
  opponentTeamId: string;
  playerTeamName: string | null;
  opponentTeamName: string | null;
}

export interface LiveEventsApi {
  finalStage: LiveEventsFinalStageApi;
  totalEvents: number;
  events: LiveEventApi[];
}
