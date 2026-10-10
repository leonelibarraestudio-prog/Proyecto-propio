export interface LiveEventsNarrativeLineApi {
  lineSequence: number;
  type: string;
  speakerId: string | null;
  text: string;
}

export interface LiveEventsValuesApi {
  actorIdentityId?: string;
  actorHeroId?: string;
  actorSideCode?: string;
  targetId?: string;
  targetHeroIds?: string[];
  targetSideCode?: string;
  playerTeamId?: string;
  opponentTeamId?: string;
  actionName?: string;
  actionCode?: string;
  strategyCode?: string;
  amount?: number;
  damage?: number;
  energy?: number;
  apChange?: number;
  abilityPoints?: number;
}

export interface LiveEventApi {
  sequence: number;
  turn: number;
  phase: string;
  eventCode: string;
  messageCode: string;
  values: LiveEventsValuesApi;
  narrative: { lines: LiveEventsNarrativeLineApi[] };
}

export interface LiveEventsFinalStageApi {
  variant: string;
  attemptId: string;
  status: string;
  phase: string;
  phaseLabel: string;
  normalTurn: number;
  turnState: string;
  participants: { playerTeamId: string; opponentTeamId: string };
  completion: {
    outcomeCode: string;
    terminalReasonCode: string;
    endingEventSequences: number[];
  } | null;
}

export interface LiveEventsApi {
  finalStage: LiveEventsFinalStageApi;
  events: LiveEventApi[];
}