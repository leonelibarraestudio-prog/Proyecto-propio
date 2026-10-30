// ---------- Game API shapes (what the Game API publishes) ----------

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

export interface InventoryItemApi {
  itemId: string;
  quantity: number;
  legalUseContexts: string[];
}

export interface InventoryApi {
  attemptId: string;
  teamId: string;
  items: InventoryItemApi[];
}

export interface PurchaseApi {
  teamId: string;
  rewardPoints: number;
  purchasedItemId: string;
  purchasedQuantity: number;
  items: InventoryItemApi[];
}

export interface UsedItemApi {
  teamId: string;
  items: InventoryItemApi[];
  usedItemId: string;
  targetHeroId: string | null;
}

export interface JourneyHeroApi {
  heroId: string;
  currentEnergy: number;
  currentAbilityPoints: number;
  status: string;
  knockedOut: boolean;
}

export interface JourneyTeamApi {
  teamId: string;
  name: string;
  leaderId: string;
  strategyCode: string;
  heroes: JourneyHeroApi[];
}

export interface JourneyTeamsApi {
  teams: JourneyTeamApi[];
  finalists: { playerTeamId: string; opponentTeamId: string };
}

export interface HeroIdentityCatalogApi {
  heroes: { id: string; displayName: string }[];
}

export interface StrategyApi {
  code: string;
  label: string;
  description: string;
}

export interface StrategyCatalogApi {
  language: string;
  strategies: StrategyApi[];
}

export interface SavedPreparationApi {
  strategyCode: string;
  activeHeroIds: string[];
}

export interface CurrentJourneyApi {
  attempt: { attemptId: string } | null;
}

export interface FinalStageStateApi {
  status: string;
  completion: unknown | null;
}

// ---------- Contract with the Angular frontend (what this feature returns) ----------

export type FinalStageAction = 'START' | 'CONTINUE' | 'VIEW' | 'UNAVAILABLE';

export interface PreparationInventoryItem {
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

export interface FinalPreparationModel {
  available: boolean;
  balance: number;
  powerUps: PowerUpApi[];
  inventory: PreparationInventoryItem[];
  heroes: PreparationHero[];
  leaderId: string;
  strategyCode: string;
  strategies: StrategyApi[];
  playerTeamName: string;
  opponentName: string | null;
  finalAction: FinalStageAction;
}
