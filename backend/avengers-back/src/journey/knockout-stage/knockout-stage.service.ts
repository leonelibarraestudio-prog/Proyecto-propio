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

    // Ambas consultas utilizan el cliente compartido existente, sin modificarlo.
    const [stages, encountersResponse] = await Promise.all([
      this.game.obtenerEtapasActuales(teamId),
      this.game.obtenerEncuentrosActuales(teamId),
    ]);

    const knockout = stages as typeof stages & KnockoutJourneyStages;
    const encountersById = new Map(
      encountersResponse.encounters.map((encounter) => [encounter.encounterId, encounter]),
    );

    // Se conserva la llave oficial: orden, posiciones, ganadores y progresión.
    // Los detalles se incorporan únicamente cuando hay un encuentro coincidente.
    const rounds: KnockoutStageRound[] = (knockout.knockout?.rounds ?? []).map(
      (round) => ({
        ...round,
        matches: round.matches.map((match) => {
          const encounter = encountersById.get(match.encounterId);
          if (!encounter) {
            return match;
          }

          return {
            ...match,
            resolutionCode: encounter.resolutionCode,
            results: encounter.results,
            damageByTeam: encounter.damageByTeam,
          };
        }),
      }),
    );

    return {
      teamId,
      journeyAvailable: true,
      stageCount: current.attempt.stageCount,
      encounterCount: current.attempt.encounterCount,
      rounds,
      finalists: knockout.finalists ?? null,
    };
  }
}
