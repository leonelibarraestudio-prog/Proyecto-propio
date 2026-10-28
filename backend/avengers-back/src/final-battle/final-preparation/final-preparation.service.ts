import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import {
  FinalPreparationModel,
  InventoryApi,
  PowerUpApi,
  PowerUpCatalogApi,
  PreparationInventoryItem,
  PurchaseApi,
  RewardsApi,
  UsedItemApi
} from './model/store-api.model';
import { PurchasePowerUpRequest,  } from './request/purchase-power-up.request';
import { UsePowerUpRequest } from './request/use-power-up.request';
import { request } from 'node_modules/axios/index.cjs';


@Injectable()
export class FinalPreparationService {
constructor(
    private readonly context: ApplicationContextService,
    private readonly api: GameApiService,
  ) {}

  async getPreparation(): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    const lang = this.context.language;
    const [rewards, inventory, catalog] = await Promise.all([
      this.api.get<RewardsApi>(`/teams/${teamId}/journeys/current/rewards`),
      this.api.get<InventoryApi>(`/teams/${teamId}/journeys/current/inventory`),
      this.api.get<PowerUpCatalogApi>('/reference/power-ups', { teamId, lang }),
    ]);
    return {
      balance: rewards.balance,
      powerUps: catalog.powerUps,
      inventory: this.describeInventory(inventory, catalog.powerUps),
    };
  }

  async useItem(request: UsePowerUpRequest): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    const body = request.targetHeroId
    ? { itemId: request.itemId, targetHeroId: request.targetHeroId }
    : { itemId: request.itemId };
    await this.api.post<UsedItemApi>(
      `/teams/${teamId}/journeys/current/preparation/items`,
      body,
    );
    return this.getPreparation();
  }

  async purchase(request: PurchasePowerUpRequest): Promise<FinalPreparationModel> {
  const teamId = this.context.getCurrentTeamId();
    await this.api.post<PurchaseApi>(`/teams/${teamId}/journeys/current/purchases`, {
    itemId: request.itemId,
    quantity: request.quantity,
    });
    return this.getPreparation();
  }
  private describeInventory(
    inventory: InventoryApi,
    powerUps: PowerUpApi[],
  ): PreparationInventoryItem[] {
    return inventory.items.map((item) => {
      const definition = powerUps.find((powerUp) => powerUp.id === item.itemId);
      return {
        itemId: item.itemId,
        name: definition?.name ?? item.itemId,
        description: definition?.description ?? '',
        quantity: item.quantity,
        targetScope: definition?.targetScope ?? 'HERO',
      };
    });

  }
}  

