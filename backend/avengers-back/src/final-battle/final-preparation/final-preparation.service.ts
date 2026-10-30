import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import {
  CurrentJourneyApi,
  FinalPreparationModel,
  FinalStageAction,
  FinalStageStateApi,
  HeroIdentityCatalogApi,
  InventoryApi,
  JourneyTeamApi,
  JourneyTeamsApi,
  PowerUpApi,
  PowerUpCatalogApi,
  PreparationHero,
  PreparationInventoryItem,
  PurchaseApi,
  RewardsApi,
  SavedPreparationApi,
  StrategyCatalogApi,
  UsedItemApi,
} from './model/store-api.model';
import { PurchasePowerUpRequest } from './request/purchase-power-up.request';
import { SavePreparationRequest } from './request/save-preparation.request';
import { UsePowerUpRequest } from './request/use-power-up.request';

@Injectable()
export class FinalPreparationService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly api: GameApiService,
  ) {}

  // Reads everything the preparation screen needs and shapes it for the frontend.
  async getPreparation(): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    const lang = this.context.language;

    const current = await this.api.get<CurrentJourneyApi>(`/teams/${teamId}/journeys/current`, {
      lang,
    });
    if (!current.attempt) {
      return this.emptyPreparation();
    }

    const [rewards, inventory, catalog, journeyTeams, heroCatalog, strategyCatalog, finalState] =
      await Promise.all([
        this.api.get<RewardsApi>(`/teams/${teamId}/journeys/current/rewards`),
        this.api.get<InventoryApi>(`/teams/${teamId}/journeys/current/inventory`),
        this.api.get<PowerUpCatalogApi>('/reference/power-ups', { teamId, lang }),
        this.api.get<JourneyTeamsApi>(`/teams/${teamId}/journeys/current/teams`),
        this.api.get<HeroIdentityCatalogApi>('/heroes', { lang }),
        this.api.get<StrategyCatalogApi>('/reference/strategies', { teamId, lang }),
        this.readFinalState(teamId, lang),
      ]);

    const playerTeam = this.findTeam(journeyTeams, journeyTeams.finalists.playerTeamId);
    const opponentTeam = this.findTeam(journeyTeams, journeyTeams.finalists.opponentTeamId);

    return {
      available: true,
      balance: rewards.balance,
      powerUps: catalog.powerUps,
      inventory: this.describeInventory(inventory, catalog.powerUps),
      heroes: this.describeHeroes(playerTeam, heroCatalog),
      leaderId: playerTeam?.leaderId ?? '',
      strategyCode: playerTeam?.strategyCode ?? '',
      strategies: strategyCatalog.strategies,
      playerTeamName: playerTeam?.name ?? teamId,
      opponentName: opponentTeam?.name ?? null,
      finalAction: this.describeFinalAction(finalState),
    };
  }

  // Buys one power-up. The Game API decides if the purchase is legal.
  async purchase(request: PurchasePowerUpRequest): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    await this.api.post<PurchaseApi>(`/teams/${teamId}/journeys/current/purchases`, {
      itemId: request.itemId,
      quantity: request.quantity,
    });
    return this.getPreparation();
  }

  // Uses one owned power-up. A Hero target is sent only when the request has one.
  async useItem(request: UsePowerUpRequest): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    const body = request.targetHeroId
      ? { itemId: request.itemId, targetHeroId: request.targetHeroId }
      : { itemId: request.itemId };
    await this.api.post<UsedItemApi>(`/teams/${teamId}/journeys/current/preparation/items`, body);
    return this.getPreparation();
  }

  // Saves the Active Heroes and the combat strategy. The Game API validates the formation.
  async savePreparation(request: SavePreparationRequest): Promise<FinalPreparationModel> {
    const teamId = this.context.getCurrentTeamId();
    await this.api.put<SavedPreparationApi>(`/teams/${teamId}/journeys/current/preparation`, {
      activeHeroIds: request.activeHeroIds,
      strategy: request.strategy,
    });
    return this.getPreparation();
  }

  // Shape returned when there is no current Journey to prepare for.
  private emptyPreparation(): FinalPreparationModel {
    return {
      available: false,
      balance: 0,
      powerUps: [],
      inventory: [],
      heroes: [],
      leaderId: '',
      strategyCode: '',
      strategies: [],
      playerTeamName: '',
      opponentName: null,
      finalAction: 'UNAVAILABLE',
    };
  }

  // The Final state is optional for this screen: if it cannot be read, the screen
  // still works and only the "start Final" button becomes unavailable.
  private async readFinalState(teamId: string, lang: string): Promise<FinalStageStateApi | null> {
    try {
      return await this.api.get<FinalStageStateApi>(
        `/teams/${teamId}/journeys/current/final-stage`,
        { lang },
      );
    } catch {
      return null;
    }
  }

  private describeFinalAction(state: FinalStageStateApi | null): FinalStageAction {
    if (!state) {
      return 'UNAVAILABLE';
    }
    if (state.completion) {
      return 'VIEW';
    }
    return state.status === 'ACTIVE' ? 'CONTINUE' : 'START';
  }

  private findTeam(journeyTeams: JourneyTeamsApi, teamId: string): JourneyTeamApi | undefined {
    return journeyTeams.teams.find((team) => team.teamId === teamId);
  }

  // The inventory only has ids and quantities; names come from the Store catalog.
  private describeInventory(
    inventory: InventoryApi,
    powerUps: PowerUpApi[],
  ): PreparationInventoryItem[] {
    return inventory.items.map((owned) => {
      const definition = powerUps.find((powerUp) => powerUp.id === owned.itemId);
      return {
        itemId: owned.itemId,
        name: definition?.name ?? owned.itemId,
        description: definition?.description ?? '',
        quantity: owned.quantity,
        targetScope: definition?.targetScope ?? 'HERO',
      };
    });
  }

  private describeHeroes(
    playerTeam: JourneyTeamApi | undefined,
    heroCatalog: HeroIdentityCatalogApi,
  ): PreparationHero[] {
    if (!playerTeam) {
      return [];
    }
    return playerTeam.heroes.map((hero) => ({
      heroId: hero.heroId,
      name:
        heroCatalog.heroes.find((identity) => identity.id === hero.heroId)?.displayName ??
        hero.heroId,
      status: hero.status,
      knockedOut: hero.knockedOut,
      energy: hero.currentEnergy,
      abilityPoints: hero.currentAbilityPoints,
    }));
  }
}
