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
    balance: number;
    inventory: InventoryItemView[];
    powerUps: PowerUpApi[]
    heroes: PreparationHero[]
    leaderId: string
    strategyCode: string;
    strategies: StrategyOption[];
}