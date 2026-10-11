import { Injectable } from '@angular/core';
import { BaseApiService }  from '../../../../core/services/base-api.service';
import { ApiService } from '../../../../core/services/api.service';
import { FinalStageStateApi } from '../model/team-status-api.model';


@Injectable({ providedIn: 'root' })
export class TeamStatusService extends BaseApiService {
  private readonly pageState: {
    status: 'loading' | 'error' | 'data';
    error: string | null;
    data: FinalStageStateApi | null;
  } = {
    status: 'loading',
    error: null,
    data: null,
  };
  constructor(api: ApiService){
    super(api);
  }
  initialize(): void {
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.getData<FinalStageStateApi>('/final-stage/status')
      .subscribe ({
        next: (data) => {
          this.pageState.data = data;
          this.pageState.status = 'data';
        },
        error: () => {
          this.pageState.error = 'No se pudo cargar el dato de la Final.';
          this.pageState.status = 'error';
        },
      });
  }
  getViewModel(){
    return this.pageState;
  }
}
