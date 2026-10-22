import { Injectable } from '@angular/core';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { AppContextService } from '../../../../core/services/app-context.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { AppLanguage } from '../../../../core/services/i18n.service';

export interface HistoryItem {
  attemptId: string;
  status: string;
  createdAt: string;
  completedAt: string;
  spendingStrategyCode: string;
  outcomeCode: string;
  opponentFinalistId: string;
  opponentFinalistName: string;
  endingCode: string;
  terminalReasonCode: string | null;
  endingSummary: string;
}

export interface HistoryApi {
  teamId: string;
  language: string;
  summary: { total: number; victories: number; defeats: number; abandoned: number };
  items: HistoryItem[];
}

export interface HistoryViewModel {
  status: 'loading' | 'data' | 'empty' | 'error';
  error: string | null;
  errorCode: string | null;
  data: HistoryApi | null;
  lang: AppLanguage;
}

@Injectable({ providedIn: 'root' })
export class HistoryService extends BaseApiService {
  private readonly pageState: HistoryViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
    lang: 'es',
  };

  constructor(
    api: ApiService,
    private readonly appContextService: AppContextService,
  ) {
    super(api);
  }

  getViewModel(): HistoryViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.pageState.lang = this.appContextService.getCurrentLang();
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