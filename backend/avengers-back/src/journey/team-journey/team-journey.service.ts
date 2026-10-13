import { Injectable } from '@nestjs/common';
import { GameFeatureApiService } from 'src/basic/game-feature-api.service';
import { ApplicationContextService } from 'src/basic/services/application-context.service';
import { TeamJourneyModel } from './model/team-journey.model';
import { ErrorUtils } from 'src/basic/error/error.utils';

@Injectable()
export class TeamJourneyService {
  constructor(
    private readonly applicationContextService: ApplicationContextService,
    private readonly gameFeaturedApiService: GameFeatureApiService,
  ) {}

  async getJourney(): Promise<TeamJourneyModel> {
    const teamId = this.applicationContextService.getCurrentTeamId();
    const language = this.applicationContextService.language;

    try {
      // Waits for the current journey from the Game API.
      const currentJourney = await this.gameFeaturedApiService.currentJourney(teamId, language);
      // Builds the response with the data needed for CP2.
      return {
        teamId,
        attemptId: currentJourney.attempt?.id ?? null,
        status: currentJourney.attempt?.status ?? null,
        stageCount: currentJourney.attempt?.stageCount ?? null,
        encounterCount: currentJourney.attempt?.encounterCount ?? null,
      };
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
