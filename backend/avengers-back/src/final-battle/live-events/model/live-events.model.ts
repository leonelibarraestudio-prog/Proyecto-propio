export type LiveEventsHeroSide = 'PLAYER' | 'OPPONENT';

export interface LiveEventsHeroRef {
  id: string;
  name: string | null;
  side: LiveEventsHeroSide | null;
}

export interface LiveEventsNarrativeLine {
  lineSequence: number;
  type: string;
  speaker: LiveEventsHeroRef | null;
  text: string;
}

export interface LiveEventItem {
  sequence: number;
  turn: number;
  phase: string;
  eventCode: string;
  actor: LiveEventsHeroRef | null;
  targets: LiveEventsHeroRef[];
  targetSideCode: string | null;
  targetTeamSide: string | null;
  actionName: string | null;
  actionCode: string | null;
  damage: number | null;
  amount: number | null;
  apChange: number | null;
  abilityPoints: number | null;
  energy: number | null;
  strategyCode: string | null;
  statCode: string | null;
  percent: number | null;
  duration: number | null;
  lines: LiveEventsNarrativeLine[];
}

export interface LiveEventsStatus {
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

export interface LiveEventsModel {
  finalStage: LiveEventsStatus;
  totalEvents: number;
  events: LiveEventItem[];
}