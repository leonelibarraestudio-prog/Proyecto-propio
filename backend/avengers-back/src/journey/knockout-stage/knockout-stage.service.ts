
import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import {
  KnockoutStageFinalists,
  KnockoutStageModel,
  KnockoutStageRound,
} from './model/knockout-stage.model';

interface KnockoutJourneyStages {
  knockout?: {
    rounds: KnockoutStageRound[];
  };
  finalists?: KnockoutStageFinalists | null;
}

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

    if (current.attempt === null) {
      return {
        teamId,
        journeyAvailable: false,
        stageCount: 0,
        encounterCount: 0,
        rounds: [],
        finalists: null,
      };
    }

    const stages = await this.game.obtenerEtapasActuales(teamId);

    const knockout = stages as typeof stages & KnockoutJourneyStages;

    return {
      teamId,
      journeyAvailable: true,
      stageCount: current.attempt.stageCount,
      encounterCount: current.attempt.encounterCount,
      rounds: knockout.knockout?.rounds ?? [],
      finalists: knockout.finalists ?? null,
    };
  }
}
