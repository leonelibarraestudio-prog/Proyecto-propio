import { Injectable } from '@angular/core';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';

export interface HistoryApi {
  teamId: string;
  language: string;
  items: unknown[];
}

export interface HistoryViewModel {
  status: 'loading' | 'data' | 'empty' | 'error';
  error: string | null;
  errorCode: string | null;
  data: HistoryApi | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryService extends BaseApiService {
  private readonly pageState: HistoryViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
  };

  constructor(api: ApiService) {
    super(api);
  }

  getViewModel(): HistoryViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;

    this.getData<HistoryApi>('/results/history', {}).subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status = data.items.length ? 'data' : 'empty';
      },
      error: (error: unknown) => {
        const apiError: ApiError = toApiError(error);
        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
        this.pageState.errorCode = apiError.messageCode;
      },
    });
  }
}