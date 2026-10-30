export type FinalStageAction = 'START' | 'CONTINUE' | 'VIEW' | 'UNAVAILABLE';

export interface PowerUpApi {
  id: string;
  name: string;
  description: string;
  price: number;
  targetScope: 'HERO' | 'TEAM';
}

export interface InventoryItemView {
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  targetScope: 'HERO' | 'TEAM';
}

export interface PreparationHero {
  heroId: string;
  name: string;
  status: string;
  knockedOut: boolean;
  energy: number;
  abilityPoints: number;
}

export interface StrategyOption {
  code: string;
  label: string;
  description: string;
}

export interface FinalPreparationApi {
  available: boolean;
  balance: number;
  powerUps: PowerUpApi[];
  inventory: InventoryItemView[];
  heroes: PreparationHero[];
  leaderId: string;
  strategyCode: string;
  strategies: StrategyOption[];
  playerTeamName: string;
  opponentName: string | null;
  finalAction: FinalStageAction;
}
