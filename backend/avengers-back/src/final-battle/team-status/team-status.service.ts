import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameApiService } from '../../basic/game-api.service';
import {
  FinalStageStateApi,
  FinalStageTeamApi,
  FinalStageTeamsApi,
} from './model/team-status-api.model';
import {
  TeamStatusModel,
  TeamStatusTeamModel,
  TeamStatusTeamsModel,
} from './model/team-status.model';
import { ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';

@Injectable()
export class TeamStatusService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly gameApi: GameApiService,
    private readonly gameFeatureApi: GameFeatureApiService,
  ) { }

  async getTeamStatus(): Promise<TeamStatusModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    const finalStage = await this.gameApi.get<FinalStageStateApi>(
      `/teams/${teamId}/journeys/current/final-stage`,
      { lang: language },
    );
    let teams: TeamStatusTeamsModel | null = null;

    try {
      const apiTeams = await this.gameApi.get<FinalStageTeamsApi>(
        `/teams/${teamId}/journeys/current/final-stage/teams`,
      );
      const [catalog, journeyTeams] = await Promise.all([
        this.gameFeatureApi.heroes(language),
        this.gameFeatureApi.currentTeams(teamId),
      ]);
      const enrichTeam = (team: FinalStageTeamApi): TeamStatusTeamModel => {
        const identity = journeyTeams.teams.find(
          (candidate) => candidate.teamId === team.teamId,
        );
        return {
          ...team,
          displayName: identity?.name?.trim() || 'Equipo sin nombre disponible',
          heroes: team.heroes.map((tacticalHero) => {
            const identity = catalog.heroes.find((hero) => hero.id === tacticalHero.heroId);

            return {
              ...tacticalHero,
              displayName: identity?.displayName ?? tacticalHero.heroId,
            };
          }),
        };
      };
      teams = {
        ...apiTeams,
        player: enrichTeam(apiTeams.player),
        opponent: enrichTeam(apiTeams.opponent),
      };
    } catch (error: unknown) {
      const details = ErrorUtils.extractExceptionDetails(error);
      if (details.messageCode !== 'FINAL_STAGE_NOT_ACTIVE') {
        throw error;
      }
    }
    return {
      finalStage,
      teams,
    };
  }
}
