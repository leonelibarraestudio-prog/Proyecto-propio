// Public facts used by R9.

// Hero Data
export interface BattleHero {
  heroId: string;
  name: string;
  status: string;
  condition: string;
  maximumEnergy: number;
  currentEnergy: number;
  maximumAbilityPoints: number;
  currentAbilityPoints: number;
  returnAtTurn: number;
}

// Team Data
export interface BattleTeam {
  teamId: string;
  name: string;
  leaderId: string;
  strategyCode: string;
  strategyLabel: string;
  synergyCode: string;
  teamActionsRemaining: number;
  leaderAbilityUsesRemaining: number;
  strategyChangesRemaining: number;
  vacantActiveHeroIds: string[];
  heroes: BattleHero[];
}

// General State
export interface BattleState {
  variant: string;
  attemptId: string;
  status: string;
  phase: string;
  phaseLabel: string;
  normalTurn: number;
  turnState: string;
  participants: { playerTeamId: string; opponentTeamId: string };
  completion: {
    outcomeCode: string; // Whether our team won or lost the battle
    endingCode: string; // How the story concludes
    terminalReasonCode: string | null; // Why the battle ended
    endingEventSequences: number[]; // Events that explain the final result
  } | null;
}

// Special state data from the Game API's optional "doom" field
export interface BattleSpecialState {
  narrativeCharacterId: string;
  maximumEnergy: number;
  currentEnergy: number;
  threatLevelCode: string;
}

// Legal Action
export interface BattleAction {
  actionId: string;
  actionCode: string;
  label: string;
  description: string;
  actorHeroId?: string;
  abilityId?: string;
  itemId?: string;
  strategyCode?: string;
  roleCombination?: string;
  outgoingHeroId?: string; // Hero leaving the active team
  incomingHeroId?: string; // Hero entering the active team
  target: {
    targetType: string;
    targetId: string;
    sideCode: string;
  } | null;
  cost: { abilityPoints: number };
  targetLabel: string;
  formationLabel: string | null;
}

//Narrative and Events
export interface BattleEvent {
  sequence: number;
  turn: number;
  phase: string;
  eventCode: string;
  messageCode: string;

  // Event data, such as damage dealt or energy restored
  values: Record<string, string | number | boolean | string[] | null>;

  narrative: {
    lines: {
      lineSequence: number;
      type: string;
      speakerId: string | null;
      text: string;
    }[];
  } | null;
}

// Inventory
export interface BattleItem {
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  targetScope: string; // Who the item can affect
  legalUseContexts: string[]; // When the item can be used
}

// All the data combined in one object
export interface FinalBattleModel {
  teamId: string;
  language: 'es' | 'en';
  available: boolean;
  state: BattleState | null;
  player: BattleTeam | null;
  opponent: BattleTeam | null;
  special: BattleSpecialState | null;
  actions: BattleAction[];
  events: BattleEvent[];
  inventory: BattleItem[];
  canStart: boolean;
  canAbandon: boolean;
}

// Commands defined by the Game API contract for /final-stage/play
export type BattleCommand =
  | { type: 'START' }
  | { type: 'CHOOSE_ACTION'; actionId: string }
  | { type: 'ABANDON' };


// Battle status and results after executing a command
export interface BattleReceipt {
  phase: string;
  normalTurn: number;
  status: string;
  completionOutcome: string | null;
  endingCode: string | null;
  terminalReasonCode: string | null;
  nextDecisionRequired: boolean;
  emittedEvents: BattleEvent[];
}

