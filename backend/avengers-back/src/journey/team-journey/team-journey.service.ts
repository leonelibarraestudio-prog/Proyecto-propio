import { Injectable } from '@nestjs/common';
import { GameFeatureApiService } from 'src/basic/game-feature-api.service';
import { ApplicationContextService } from 'src/basic/services/application-context.service';
import { TeamJourneyModel } from './model/team-journey.model';
import { ErrorUtils } from 'src/basic/error/error.utils';
import { GameApiService } from 'src/basic/game-api.service';
import { JourneyEncountersApi } from './model/team-journey-game-api.model';

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
      // Waits for the current journey from the Game API.
      const currentJourney = await this.gameFeaturedApiService.currentJourney(teamId, language);

      const result: TeamJourneyModel = {
        teamId,
        language,
        attemptId: currentJourney.attempt?.id ?? null,
        status: currentJourney.attempt?.status ?? null,
        stageCount: currentJourney.attempt?.stageCount ?? null,
        encounterCount: currentJourney.attempt?.encounterCount ?? null,
        teamNames: {},
        heroNames: {},
        teams: [],
        encounters: [],
        final: null,
      };

      if (!currentJourney.attempt) {
        return result;
      }

      // Get the current Journey teams, hero catalog, and encounters.
      const [journeyTeams, heroCatalog, journeyEncounters] = await Promise.all([
        this.gameFeaturedApiService.currentTeams(teamId),
        this.gameFeaturedApiService.heroes(language),
        this.gameApiService.get<JourneyEncountersApi>(`${basePath}/encounters`),
      ]);

      // Maps hero IDs to hero names.
      for (const hero of heroCatalog.heroes) {
        result.heroNames[hero.id] = hero.displayName;
      }

      // Builds each team with its heroes.
      for (const team of journeyTeams.teams) {
        result.teamNames[team.teamId] = team.name;

        const heroes = [];

        // Adds each hero to the current team.
        for (const heroId of team.heroIds) {
          heroes.push({
            id: heroId,
            name: result.heroNames[heroId] ?? heroId,
          });
        }
      }

      for (const encounter of journeyEncounters.encounters) {
        // Skip encounters where the player team does not participate.
        if (encounter.teamAId !== teamId && encounter.teamBId !== teamId) {
          continue;
        }

        // Saves the other team as the opponent.
        const opponentTeamId = encounter.teamAId === teamId ? encounter.teamBId : encounter.teamAId;
        const opponentTeam = result.teams.find((team) => team.teamId === opponentTeamId);

        // Gets the player team's result.
        const resultCode =
          encounter.results.find((item) => item.teamId === teamId)?.resultCode ?? null;

        // Gets the damage dealt by the player team.
        const damageDealt =
          encounter.damageByTeam.find((item) => item.teamId === teamId)?.damageDealt ?? null;

        // Gets the damage dealt by the opponent.
        const damageReceived =
          encounter.damageByTeam.find((item) => item.teamId === opponentTeamId)?.damageDealt ??
          null;

        // Adds the encounter to the Journey result.
        result.encounters.push({
          encounterId: encounter.encounterId,
          stageCode: encounter.stageCode,
          opponentTeamId,
          opponentName: result.teamNames[opponentTeamId] ?? opponentTeamId,
          opponentLeaderId: opponentTeam?.leaderId ?? null,
          status: 'COMPLETED', // Game API publishes already resolved encounters in this list.
          resultCode,
          damageDealt,
          damageReceived,
        });
      }

      // CONTINUARÁ
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
}
