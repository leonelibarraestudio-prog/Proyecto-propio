
import { Injectable } from '@angular/core';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';

export interface HistoryRivalsItem {
  attemptId: string;
  status: 'COMPLETED';
  createdAt: string;
  completedAt: string;
  spendingStrategyCode: 'SAVE' | 'BALANCED' | 'AGGRESSIVE';
  outcomeCode: string;
  opponentFinalistId: string;
  opponentFinalistName: string;
  endingCode: string;
  terminalReasonCode: string | null;
  endingSummary: string;
}

export interface HistoryRivalsApi {
  teamId: string;
  language: string;
  items: HistoryRivalsItem[];
}

export interface HistoryRivalsViewModel {
  status: 'loading' | 'data' | 'empty' | 'error';
  error: string | null;
  errorCode: string | null;
  data: HistoryRivalsApi | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryRivalsService extends BaseApiService {
  private readonly pageState: HistoryRivalsViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
  };

  constructor(api: ApiService) {
    super(api);
  }

  getViewModel(): HistoryRivalsViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;

    this.getData<HistoryRivalsApi>('/my-team/history-rivals').subscribe({
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
