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

export interface FinalPreparationApi {
    balance: number;
    inventory: InventoryItemView[];
    powerUps: PowerUpApi[];
}