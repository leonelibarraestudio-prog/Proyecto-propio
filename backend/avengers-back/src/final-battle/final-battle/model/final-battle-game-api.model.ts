import {
  BattleAction,
  BattleEvent,
  BattleHero,
  BattleSpecialState,
  BattleState,
  BattleTeam,
} from './final-battle.model';

// Final battle state returned by the Game API, including optional Doom data.
export interface FinalStateApi extends BattleState {
  doom?: BattleSpecialState;
  opponentAlignmentCode?: string;
  revealEventSequence?: number;
}

// Team data received from the Game API, without display names and labels.
export interface FinalTeamApi extends Omit<BattleTeam, 'name' | 'strategyLabel' | 'heroes'> {
  // Add heroes using BattleHero without name.
  heroes: Omit<BattleHero, 'name'>[];
}

// Player and opponent teams received from the Game API.
export interface FinalTeamsApi {
  variant: string;
  attemptId: string;
  player: FinalTeamApi;
  opponent: FinalTeamApi;
  doom?: BattleSpecialState;
}

// Available battle actions and current turn data received from the Game API.
export interface FinalActionsApi {
  attemptId: string;
  phase: string;
  normalTurn: number;
  language: string;

  // Use BattleAction without targetLabel or formationLabel.
  actions: Omit<BattleAction, 'targetLabel' | 'formationLabel'>[];
}

// Battle events received from the Game API.
export interface FinalEventsApi {
  attemptId: string;
  language: string;
  events: BattleEvent[];
}

// Battle inventory received from the Game API.
export interface BattleInventoryApi {
  attemptId: string;
  items: {
    itemId: string;
    quantity: number;
    legalUseContexts: string[];
  }[];
}

// Power-ups catalog received from the Game API.
export interface BattlePowerUpsApi {
  powerUps: {
    id: string;
    name: string;
    description: string;
    targetScope: string;
  }[];
}

// Strategies catalog received from the Game API.
export interface BattleStrategiesApi {
  strategies: {
    code: string;
    label: string;
  }[];
}
