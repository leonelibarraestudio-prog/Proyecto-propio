export interface PowerUpApi {
    id: string;
    name: string;
    description: string;
    price: number;
    targetScope: 'HERO' | 'TEAM';
}

export interface FinalPreparationApi {
    rewards: { balance: number; earned: number; spent: number};
    inventory: { items: unknown[] };
    powerUps: PowerUpApi[];
}