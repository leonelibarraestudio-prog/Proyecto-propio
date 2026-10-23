import { Injectable } from '@angular/core';
import { toApiError } from '../../../../core/models/api-error.interface';
import { PageState } from '../../../../core/models/page-state.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { FaseDeGruposApi } from '../model/etapas-del-journey-api.interface';

export interface EstadoVistaFaseDeGrupos extends PageState {
  datosFaseDeGrupos: FaseDeGruposApi | null;
  idDelGrupoSeleccionado: string | null;
}

@Injectable({ providedIn: 'root' })
export class GroupStageService extends BaseApiService {
  private readonly estadoDeLaFaseDeGrupos: EstadoVistaFaseDeGrupos = {
    status: 'loading',
    error: null,
    errorCode: null,
    datosFaseDeGrupos: null,
    idDelGrupoSeleccionado: null,
  };

  constructor(api: ApiService) {
    super(api);
  }

  initialize(): void {
    this.obtenerEtapasActuales();
  }

  obtenerEstadoDeLaFaseDeGrupos(): EstadoVistaFaseDeGrupos {
    return this.estadoDeLaFaseDeGrupos;
  }

  seleccionarGrupo(idDelGrupo: string): void {
    this.estadoDeLaFaseDeGrupos.idDelGrupoSeleccionado = idDelGrupo;
  }

  private obtenerEtapasActuales(): void {
    this.estadoDeLaFaseDeGrupos.status = 'loading';
    this.estadoDeLaFaseDeGrupos.error = null;
    this.estadoDeLaFaseDeGrupos.errorCode = null;
    this.estadoDeLaFaseDeGrupos.datosFaseDeGrupos = null;
    this.estadoDeLaFaseDeGrupos.idDelGrupoSeleccionado = null;

    this.getData<FaseDeGruposApi>('/journey/group-stage').subscribe({
      next: (faseDeGrupos) => {
        this.estadoDeLaFaseDeGrupos.datosFaseDeGrupos = faseDeGrupos;

        const gruposDelJourney = faseDeGrupos.groupStage.groups;
        const grupoDelEquipo = gruposDelJourney.find((grupo) =>
          grupo.standings.some((posicion) => posicion.esMiEquipo),
        );

        this.estadoDeLaFaseDeGrupos.idDelGrupoSeleccionado =
          grupoDelEquipo?.groupId ?? gruposDelJourney[0]?.groupId ?? null;

        const tieneGrupos = gruposDelJourney.length > 0;
        this.estadoDeLaFaseDeGrupos.status = tieneGrupos ? 'data' : 'empty';
      },
      error: (errorDeLaConsulta) => {
        const errorDeLaApi = toApiError(errorDeLaConsulta);

        this.estadoDeLaFaseDeGrupos.status = 'error';
        this.estadoDeLaFaseDeGrupos.errorCode = errorDeLaApi.messageCode;
        this.estadoDeLaFaseDeGrupos.error =
          errorDeLaApi.messageCode === 'JOURNEY_REQUIRED'
            ? 'Todavia no hay un journey para consultar.'
            : 'No se pudieron cargar los grupos. Proba de nuevo.';
      },
    });
  }
}
