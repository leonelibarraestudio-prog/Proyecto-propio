import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import {
  FinalPreparationModel,
  InventoryApi,
  PowerUpCatalogApi,
  RewardsApi,
} from './model/store-api.model';


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
    return { rewards, inventory, powerUps: catalog.powerUps };
  }
}  

