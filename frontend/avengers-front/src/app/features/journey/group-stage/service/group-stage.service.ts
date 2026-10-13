import { Injectable } from '@angular/core';
import { toApiError } from '../../../../core/models/api-error.interface';
import { PageState } from '../../../../core/models/page-state.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { EtapasDelJourneyApi } from '../model/etapas-del-journey-api.interface';

export interface EstadoVistaFaseDeGrupos extends PageState {
  datosFaseDeGrupos: EtapasDelJourneyApi | null;
}

@Injectable({ providedIn: 'root' })
export class GroupStageService extends BaseApiService {
  private readonly estadoDeLaFaseDeGrupos: EstadoVistaFaseDeGrupos = {
    status: 'loading',
    error: null,
    errorCode: null,
    datosFaseDeGrupos: null,
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

  private obtenerEtapasActuales(): void {
    this.estadoDeLaFaseDeGrupos.status = 'loading';
    this.estadoDeLaFaseDeGrupos.error = null;
    this.estadoDeLaFaseDeGrupos.errorCode = null;
    this.estadoDeLaFaseDeGrupos.datosFaseDeGrupos = null;

    this.getData<EtapasDelJourneyApi>('/journey/group-stage').subscribe({
      next: (etapasDelJourney) => {
        this.estadoDeLaFaseDeGrupos.datosFaseDeGrupos = etapasDelJourney;

        const tieneGrupos = etapasDelJourney.groupStage.groups.length > 0;
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
