import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../../basic/error/error-code.enum';
import { ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { EtapasDelJourneyApi } from '../../basic/model/game-api/etapas-del-journey-api.model';
import { FinalJourneyTeamsApi } from '../../basic/model/game-api/final-contract.model';
import { EncuentroDelJourneyApi } from '../../basic/model/game-api/encuentros-del-journey-api.model';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { FaseDeGruposApi } from './fase-de-grupos.model';

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

  async obtenerEtapasActuales(): Promise<FaseDeGruposApi> {
    // el id sale de config del Bff
    const equipoId = this.context.getCurrentTeamId();

    try {
      const [etapasDelJourney, equiposDelJourney, encuentrosDelJourney] =
        await Promise.all([
          this.game.obtenerEtapasActuales(equipoId),
          this.game.currentTeams(equipoId),
          this.game.obtenerEncuentrosActuales(equipoId),
        ]);

      return this.armarFaseDeGrupos(
        equipoId,
        etapasDelJourney,
        equiposDelJourney,
        encuentrosDelJourney.encounters,
      );
    } catch (errorDeLaConsulta) {
      ErrorUtils.mapGameApiError(
        errorDeLaConsulta,
        {},
        ERROR_FALLBACK_FASE_DE_GRUPOS,
      );
    }
  }

  private armarFaseDeGrupos(
    equipoId: string,
    etapasDelJourney: EtapasDelJourneyApi,
    equiposDelJourney: FinalJourneyTeamsApi,
    encuentrosDelJourney: EncuentroDelJourneyApi[],
  ): FaseDeGruposApi {
    const nombresDeEquipos = new Map<string, string>(
      equiposDelJourney.teams.map((equipo) => [equipo.teamId, equipo.name] as [string, string]),
    );

    return {
      attemptId: etapasDelJourney.attemptId,
      teamId: equipoId,
      groupStage: {
        groups: etapasDelJourney.groupStage.groups.map((grupo) => ({
          ...grupo,
          standings: grupo.standings.map((posicion) => ({
            ...posicion,
            nombreEquipo: nombresDeEquipos.get(posicion.teamId) ?? posicion.teamId,
            esMiEquipo: posicion.teamId === equipoId,
          })),
          encounters: grupo.encounterIds
            .map((idDelEncuentro) =>
              encuentrosDelJourney.find((encuentro) => encuentro.encounterId === idDelEncuentro),
            )
            .filter(
              (encuentro): encuentro is EncuentroDelJourneyApi => encuentro !== undefined,
            )
            .map((encuentro) => ({
              ...encuentro,
              nombreEquipoA: nombresDeEquipos.get(encuentro.teamAId) ?? encuentro.teamAId,
              nombreEquipoB: nombresDeEquipos.get(encuentro.teamBId) ?? encuentro.teamBId,
              seJugo:
                Boolean(encuentro.winnerTeamId) ||
                encuentro.results.some((resultado) => Boolean(resultado.resultCode)),
            })),
        })),
      },
    };
  }
}
