import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { ApiService } from '../../../../core/services/api.service';
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

  constructor(api: ApiService) {
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

    this.getData<TeamStatusModel>('/final-stage/status').subscribe({
      next: (data) => {
        this.loading = false;
        this.pageState.data = data;
        this.pageState.status = 'data';
      },
      error: (error: unknown) => {
        this.loading = false;
        const apiError = toApiError(error);

        this.pageState.errorCode = apiError.messageCode;
        this.pageState.error = apiError.message;
        this.pageState.status = apiError.messageCode === 'JOURNEY_REQUIRED' ? 'empty' : 'error';
      },
    });
  }

  getViewModel() {
    return this.pageState;
  }
}
