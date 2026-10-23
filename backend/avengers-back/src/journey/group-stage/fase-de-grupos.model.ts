import {
  GrupoDeLaFase,
  PosicionDeLaFase,
} from '../../basic/model/game-api/etapas-del-journey-api.model';
import {
  EncuentroDelJourneyApi,
} from '../../basic/model/game-api/encuentros-del-journey-api.model';

export interface FaseDeGruposApi {
  attemptId: string;
  teamId: string;
  groupStage: {
    groups: GrupoDeLaFaseApi[];
  };
}

export interface GrupoDeLaFaseApi extends GrupoDeLaFase {
  standings: PosicionDeLaFaseApi[];
  encounters: EncuentroDeLaFaseApi[];
}

export interface PosicionDeLaFaseApi extends PosicionDeLaFase {
  nombreEquipo: string;
  esMiEquipo: boolean;
}

export interface EncuentroDeLaFaseApi extends EncuentroDelJourneyApi {
  nombreEquipoA: string;
  nombreEquipoB: string;
  seJugo: boolean;
}
