export interface PowerUpEffectApi {
  effectCode: string;
  targetPercentage?: number;
  canRevive?: boolean;
  statCode?: string;
  percentage?: number;
  durationRounds?: number;
}

export interface PowerUpApi {
  id: string;
  name: string;
  description: string;
  categoryCode: string;
  price: number;
  targetScope: 'HERO' | 'TEAM';
  useContexts: string[];
  effect: PowerUpEffectApi;
}

export interface PowerUpCatalogApi {
  language: string;
  powerUps: PowerUpApi[];
}

export interface RewardsApi {
  attemptId: string;
  teamId: string;
  earned: number;
  spent: number;
  balance: number;
}

export interface InventoryApi {
  attemptId: string;
  teamId: string;
  items: Record<string, unknown>[];
}

export interface FinalPreparationModel {
  rewards: RewardsApi;
  inventory: InventoryApi;
  powerUps: PowerUpApi[];
}