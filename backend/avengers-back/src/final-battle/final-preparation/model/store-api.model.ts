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

export interface PreparationInventoryItem {
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  targetScope: 'HERO' | 'TEAM';
}

export interface FinalPreparationModel {
  balance: number;
  powerUps: PowerUpApi[];
  inventory: PreparationInventoryItem[];
}