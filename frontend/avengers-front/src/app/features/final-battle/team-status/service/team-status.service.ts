import { Injectable } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { ApiService } from '../../../../core/services/api.service';
import { AppContextService } from '../../../../core/services/app-context.service';
import { toApiError } from '../../../../core/models/api-error.interface';
import { TeamStatusModel } from '../model/team-status-api.model';

@Injectable({ providedIn: 'root' })
export class TeamStatusService extends BaseApiService {
  private readonly pageState: {
    status: 'loading' | 'error' | 'empty' | 'data';
    error: string | null;
    errorCode: string | null;
    data: TeamStatusModel | null;
  } = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
  };

  private loading = false;

  constructor(
    api: ApiService,
    private readonly context: AppContextService,
  ) {
    super(api);
  }

  initialize(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;
    this.pageState.data = null;

    forkJoin({
      data: this.getData<TeamStatusModel>('/final-stage/status'),
      context: this.context.reload(),
    })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: ({ data }) => {
          this.pageState.data = data;
          this.pageState.status = 'data';
        },
        error: (error: unknown) => {
          const apiError = toApiError(error);
          this.pageState.errorCode = apiError.messageCode;

          if (apiError.messageCode === 'JOURNEY_REQUIRED') {
            this.pageState.status = 'empty';
            return;
          }

          this.pageState.status = 'error';
          this.pageState.error =
            'No pudimos actualizar el estado de la batalla. ' +
            'Esperá unos instantes y seleccioná «Actualizar estado» para volver a intentarlo.';
        },
      });
  }

  getViewModel() {
    return this.pageState;
  }
}