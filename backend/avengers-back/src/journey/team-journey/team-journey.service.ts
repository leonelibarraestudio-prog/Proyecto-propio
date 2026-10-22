import { Injectable, NotFoundException } from '@nestjs/common';
import { GameFeatureApiService } from 'src/basic/game-feature-api.service';
import { ApplicationContextService } from 'src/basic/services/application-context.service';
import { ErrorUtils } from 'src/basic/error/error.utils';
import { GameApiService } from 'src/basic/game-api.service';
import { TeamJourneyDetailModel, TeamJourneyModel } from './model/team-journey.model';
import {
  JourneyEncounterDetailApi,
  JourneyEncountersApi,
} from './model/team-journey-game-api.model';

@Injectable()
export class TeamJourneyService {
  constructor(
    private readonly applicationContextService: ApplicationContextService,
    private readonly gameFeaturedApiService: GameFeatureApiService,
    private readonly gameApiService: GameApiService,
  ) {}

  async getJourney(): Promise<TeamJourneyModel> {
    const teamId = this.applicationContextService.getCurrentTeamId();
    const language = this.applicationContextService.language === 'es' ? 'es' : 'en';

    const basePath = `/teams/${teamId}/journeys/current`;

    try {
      const currentJourney = await this.gameFeaturedApiService.currentJourney(teamId, language);

      const result: TeamJourneyModel = {
        teamId,
        language,
        attemptId: currentJourney.attempt?.id ?? null,
        status: currentJourney.attempt?.status ?? null,
        stageCount: currentJourney.attempt?.stageCount ?? null,
        encounterCount: currentJourney.attempt?.encounterCount ?? null,
        teams: [],
        encounters: [],
        final: null,
      };

      if (!currentJourney.attempt) {
        return result;
      }

      // Gets the teams, heroes, and encounters in parallel.
      const [journeyTeams, heroCatalog, journeyEncounters] = await Promise.all([
        this.gameFeaturedApiService.currentTeams(teamId),
        this.gameFeaturedApiService.heroes(language),
        this.gameApiService.get<JourneyEncountersApi>(`${basePath}/encounters`),
      ]);

      // Internal lookup used to build the team rosters.
      const heroNames: Record<string, string> = {};

      for (const hero of heroCatalog.heroes) {
        heroNames[hero.id] = hero.displayName;
      }

      // Builds each team with its heroes.
      for (const team of journeyTeams.teams) {
        const heroes = [];

        for (const heroId of team.heroIds) {
          heroes.push({
            id: heroId,
            name: heroNames[heroId] ?? heroId,
          });
        }

        result.teams.push({
          teamId: team.teamId,
          name: team.name,
          leaderId: team.leaderId,
          heroes,
        });
      }

      for (const encounter of journeyEncounters.encounters) {
        // Keeps only the encounters where our team participates.
        if (encounter.teamAId !== teamId && encounter.teamBId !== teamId) {
          continue;
        }

        // Saves the other team as the opponent.
        const opponentTeamId = encounter.teamAId === teamId ? encounter.teamBId : encounter.teamAId;

        const resultCode =
          encounter.results.find((item) => item.teamId === teamId)?.resultCode ?? null;

        const damageDealt =
          encounter.damageByTeam.find((item) => item.teamId === teamId)?.damageDealt ?? null;

        const damageReceived =
          encounter.damageByTeam.find((item) => item.teamId === opponentTeamId)?.damageDealt ??
          null;

        result.encounters.push({
          encounterId: encounter.encounterId,
          stageCode: encounter.stageCode,
          opponentTeamId,
          status: 'COMPLETED',
          resultCode,
          damageDealt,
          damageReceived,
        });
      }

      // Adds the final stage data from the Journey summary.
      const summary = currentJourney.summary;

      if (summary) {
        result.final = {
          opponentTeamId: summary.finalists.opponentTeamId,
          status: summary.progress.finalStageStatus,
          outcome: summary.completionOutcome ?? null,
        };
      }

      return result;
    } catch (error) {
      // Handles errors from the Game API.
      ErrorUtils.mapGameApiError(
        error,
        {},
        {
          messageCode: 'TEAM_JOURNEY_UNAVAILABLE',
          message: 'Unable to load the team Journey.',
        },
      );
    }
  }

  async getEncounter(encounterId: string): Promise<TeamJourneyDetailModel> {
    const teamId = this.applicationContextService.getCurrentTeamId();
    const language = this.applicationContextService.language;
    const basePath = `/teams/${teamId}/journeys/current`;

    try {
      // Requests only the selected encounter.
      const encounterPath = `${basePath}/encounters/${encodeURIComponent(encounterId)}`;

      const detail = await this.gameApiService.get<JourneyEncounterDetailApi>(encounterPath, {
        lang: language,
      });

      // Checks that the configured team participates in the encounter.
      if (detail.teamAId !== teamId && detail.teamBId !== teamId) {
        throw new NotFoundException('Encounter is not in the player Journey.');
      }

      return {
        encounterId: detail.encounterId,
        rounds: detail.rounds,
        extraRound: detail.extraRound,
      };
    } catch (error) {
      ErrorUtils.mapGameApiError(
        error,
        {},
        {
          messageCode: 'TEAM_JOURNEY_DETAIL_UNAVAILABLE',
          message: 'Unable to load the encounter detail.',
        },
      );
    }
  }
}
