import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { ErrorCode } from '../../basic/error/error-code.enum';
import { LiveEventsModel } from './model/live-events.model';

const LIVE_EVENTS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
    message: 'The Final is not available right now.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
    message: 'The Final is not available right now.',
  },
};

const LIVE_EVENTS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
  message: 'Unable to load the Final events right now.',
};

@Injectable()
export class LiveEventsService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getEvents(): Promise<LiveEventsModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;

    try {
      const [finalStage, eventCatalog] = await Promise.all([
        this.game.finalStage(teamId, language),
        this.game.finalStageEvents(teamId, language),
      ]);
      return { finalStage, events: eventCatalog.events };
    } catch (error) {
      ErrorUtils.mapGameApiError(
        error,
        LIVE_EVENTS_API_ERROR_STATUS_MAP,
        LIVE_EVENTS_API_ERROR_FALLBACK,
      );
    }
  }
}