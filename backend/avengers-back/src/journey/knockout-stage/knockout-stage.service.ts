import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { KnockoutStageModel } from './model/knockout-stage.model';

@Injectable()
export class KnockoutStageService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getKnockoutStage(): Promise<KnockoutStageModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;

    const current = await this.game.currentJourney(teamId, language);

    return {
      teamId,
      journeyAvailable: current.attempt !== null,
      stageCount: current.attempt?.stageCount ?? 0,
      encounterCount: current.attempt?.encounterCount ?? 0,
    };
  }
}