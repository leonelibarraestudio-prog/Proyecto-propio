import { BadRequestException, Injectable } from '@nestjs/common';
import { GameApiService } from 'src/basic/game-api.service';
import { GameFeatureApiService } from 'src/basic/game-feature-api.service';
import { ApplicationContextService } from 'src/basic/services/application-context.service';
import { ErrorUtils } from 'src/basic/error/error.utils';
import {
  BattleCommand,
  BattleReceipt,
  BattleTeam,
  FinalBattleModel,
} from './model/final-battle.model';
import {
  BattleInventoryApi,
  BattlePowerUpsApi,
  BattleStrategiesApi,
  FinalActionsApi,
  FinalEventsApi,
  FinalStateApi,
  FinalTeamsApi,
} from './model/final-battle-game-api.model';
import { PlayFinalBattleRequest } from './request/play-final-battle.request';

@Injectable()
export class FinalBattleService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameApiService,
    private readonly features: GameFeatureApiService,
  ) {}

  // Get the data needed for the final battle.
  async getBattle(): Promise<FinalBattleModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    const journeyPath = `/teams/${teamId}/journeys/current`;
    const finalPath = `${journeyPath}/final-stage`;

    try {
      // Check if the team has a current journey.
      const current = await this.features.currentJourney(teamId, language);

      if (!current.attempt) {
        return {
          teamId,
          language,
          available: false,
          state: null,
          player: null,
          opponent: null,
          special: null,
          actions: [],
          events: [],
          inventory: [],
          canStart: false,
          canAbandon: false,
        };
      }

      // Get the current battle state.
      const state = await this.game.get<FinalStateApi>(finalPath, {
        lang: language,
      });

      // Get battle data from the Game API at the same time.
      const [teams, legal, events, identities, heroes, inventory, catalog, strategies] =
        await Promise.all([
          state.status === 'READY'
            ? Promise.resolve(null)
            : this.game.get<FinalTeamsApi>(`${finalPath}/teams`),

          state.status === 'ACTIVE'
            ? this.game.get<FinalActionsApi>(`${finalPath}/actions`, { lang: language })
            : Promise.resolve({ actions: [] }),

          this.game.get<FinalEventsApi>(`${finalPath}/events`, { lang: language }),
          this.features.currentTeams(teamId),
          this.features.heroes(language),
          this.game.get<BattleInventoryApi>(`${journeyPath}/inventory`),
          this.game.get<BattlePowerUpsApi>('/reference/power-ups', { lang: language }),
          this.game.get<BattleStrategiesApi>('/reference/strategies', { lang: language }),
        ]);

      // Match hero, team, and strategy IDs with their names.
      const heroNames: Record<string, string> = {};
      for (const hero of heroes.heroes) {
        heroNames[hero.id] = hero.displayName;
      }

      const teamNames: Record<string, string> = {};
      for (const team of identities.teams) {
        teamNames[team.teamId] = team.name;
      }

      const strategyNames: Record<string, string> = {};
      for (const strategy of strategies.strategies) {
        strategyNames[strategy.code] = strategy.label;
      }

      // Add team, strategy, and hero names to the Game API data.
      const namedTeams: BattleTeam[] = (teams ? [teams.player, teams.opponent] : []).map(
        (team) => ({
          ...team,
          name: teamNames[team.teamId] ?? team.teamId,
          strategyLabel: strategyNames[team.strategyCode] ?? team.strategyCode,
          heroes: team.heroes.map((hero) => ({
            ...hero,
            name: heroNames[hero.heroId] ?? hero.heroId,
          })),
        }),
      );

      // Add readable target and hero formation labels to each action.
      const actions = legal.actions.map((action) => {
        const target = action.target;
        let targetLabel = language === 'es' ? 'Sin objetivo' : 'No target';
        if (target?.targetType === 'HERO') {
          targetLabel = heroNames[target.targetId] ?? target.targetId;
        } else if (target?.targetType === 'TEAM') {
          targetLabel = teamNames[target.targetId] ?? target.targetId;
        } else if (target) {
          targetLabel = target.targetId;
        }
        const formationLabel =
          action.outgoingHeroId && action.incomingHeroId
            ? `${heroNames[action.outgoingHeroId] ?? action.outgoingHeroId} → ${heroNames[action.incomingHeroId] ?? action.incomingHeroId}`
            : null;
        return { ...action, targetLabel, formationLabel };
      });

      // Build the final battle response with all the collected data.
      return {
        teamId,
        language,
        available: true,
        state,
        player: namedTeams[0] ?? null,
        opponent: namedTeams[1] ?? null,
        special: state.doom ?? teams?.doom ?? null,
        actions,
        events: events.events,
        inventory: inventory.items.map((owned) => {
          const item = catalog.powerUps.find((entry) => entry.id === owned.itemId);
          return {
            ...owned,
            name: item?.name ?? owned.itemId,
            description: item?.description ?? '',
            targetScope: item?.targetScope ?? '',
          };
        }),
        canStart: state.status === 'READY' && state.turnState === 'AWAITING_START',
        canAbandon: state.status === 'ACTIVE',
      };

      // Handle errors when loading the final battle.
    } catch (error) {
      ErrorUtils.mapGameApiError(
        error,
        {},
        {
          messageCode: 'FINAL_BATTLE_UNAVAILABLE',
          message: 'Unable to load the final battle.',
        },
      );
    }
  }

  // Validate and prepare the player's battle command.
  async play(request: PlayFinalBattleRequest): Promise<BattleReceipt> {
    let command: BattleCommand;
    if (request.type === 'CHOOSE_ACTION') {
      if (!request.actionId?.trim()) {
        throw new BadRequestException('CHOOSE_ACTION requires actionId.');
      }
      command = { type: 'CHOOSE_ACTION', actionId: request.actionId };
    } else {
      if (request.actionId !== undefined) {
        throw new BadRequestException('START and ABANDON do not accept actionId.');
      }
      command = { type: request.type };
    }

    // Send the battle command to the Game API and handle errors.
    const teamId = this.context.getCurrentTeamId();
    try {
      return await this.game.post<BattleReceipt>(
        `/teams/${teamId}/journeys/current/final-stage/play`,
        command,
        { lang: this.context.language },
      );
    } catch (error) {
      ErrorUtils.mapGameApiError(
        error,
        {},
        {
          messageCode: 'FINAL_BATTLE_COMMAND_FAILED',
          message: 'Unable to confirm the battle command.',
        },
      );
    }
  }
}
