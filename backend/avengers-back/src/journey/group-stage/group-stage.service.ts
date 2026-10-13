import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../../basic/error/error-code.enum';
import { ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { EtapasDelJourneyApi } from '../../basic/model/game-api/etapas-del-journey-api.model';
import { ApplicationContextService } from '../../basic/services/application-context.service';

const ERROR_FALLBACK_FASE_DE_GRUPOS = {
  messageCode: ErrorCode.JOURNEY_UNAVAILABLE,
  message: 'No se pudieron cargar los grupos. Proba de nuevo.',
};

@Injectable()
export class GroupStageService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async obtenerEtapasActuales(): Promise<EtapasDelJourneyApi> {
    // el id sale de config del Bff
    const equipoId = this.context.getCurrentTeamId();

    try {
      return await this.game.obtenerEtapasActuales(equipoId);
    } catch (errorDeLaConsulta) {
      ErrorUtils.mapGameApiError(
        errorDeLaConsulta,
        {},
        ERROR_FALLBACK_FASE_DE_GRUPOS,
      );
    }
  }
}
