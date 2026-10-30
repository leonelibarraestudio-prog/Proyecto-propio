import { Injectable } from '@angular/core';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { AppContextService } from '../../../../core/services/app-context.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { AppLanguage } from '../../../../core/services/i18n.service';

const EVENTS_PAGE_SIZE = 50;

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

export interface HistoryHero {
  heroId: string;
  status: string;
  knockedOut: boolean;
}

export interface HistoryTeam {
  teamId: string;
  name: string;
  leaderId: string;
  strategyCode: string;
  rewardPoints?: number;
  eliminated?: boolean;
  heroes?: HistoryHero[];
}

export interface HistoryEvent {
  sequence: number;
  narrative: { lines: Array<{ lineSequence: number; text: string }> };
}

export interface HistoryTeamStatistics {
  teamId: string;
  encounters: number;
  wins: number;
  draws: number;
  losses: number;
  damageDealt: number;
  damageReceived: number;
  kosCaused: number;
  kosSuffered: number;
}

export interface HistoryAward {
  code: string;
  label: string;
  reason: string;
  winner: { teamId: string; heroId: string } | null;
}

export interface HistoryJourneySummary {
  attemptId: string;
  createdAt: string;
  completedAt: string | null;
  spendingStrategyCode: string;
  completionOutcome?: string | null;
  finalists: { playerTeamId: string; opponentTeamId: string };
  progress: { stagesCompleted: number; encountersPlayedByPlayer: number };
}

export interface HistoryStatistics {
  competition: { journeyEncounters: number };
  teamStatistics: HistoryTeamStatistics[];
  awards: HistoryAward[];
}

export interface HistoryDetailApi {
  summary: HistoryJourneySummary;
  teams: HistoryTeam[];
  teamNames: Record<string, string>;
  events: HistoryEvent[];
  statistics: HistoryStatistics | null;
}

export interface HistoryDetailViewModel {
  status: 'loading' | 'data' | 'error';
  attemptId: string;
  attemptNumber: number;
  error: string | null;
  errorCode: string | null;
  data: HistoryDetailApi | null;
  visibleEvents: number;
}

export interface HistoryViewModel {
  status: 'loading' | 'data' | 'empty' | 'error';
  error: string | null;
  errorCode: string | null;
  data: HistoryApi | null;
  lang: AppLanguage;
  detail: HistoryDetailViewModel | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryService extends BaseApiService {
  private readonly pageState: HistoryViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
    lang: 'es',
    detail: null,
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
    this.pageState.detail = null;

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

  openDetail(attemptId: string, attemptNumber: number): void {
    const detail: HistoryDetailViewModel = {
      status: 'loading',
      attemptId,
      attemptNumber,
      error: null,
      errorCode: null,
      data: null,
      visibleEvents: EVENTS_PAGE_SIZE,
    };
    this.pageState.detail = detail;
    this.loadDetail(detail);
  }

  retryDetail(): void {
    const detail = this.pageState.detail;
    if (detail) {
      this.loadDetail(detail);
    }
  }

  closeDetail(): void {
    this.pageState.detail = null;
  }

  showMoreEvents(): void {
    const detail = this.pageState.detail;
    if (detail) {
      detail.visibleEvents += EVENTS_PAGE_SIZE;
    }
  }

  private loadDetail(detail: HistoryDetailViewModel): void {
    detail.status = 'loading';
    detail.error = null;
    detail.errorCode = null;

    this.getData<HistoryDetailApi>(
      `/results/history/${encodeURIComponent(detail.attemptId)}`,
      {},
    ).subscribe({
      next: (data) => {
        detail.data = data;
        detail.status = 'data';
      },
      error: (error: unknown) => {
        const apiError: ApiError = toApiError(error);
        detail.status = 'error';
        detail.error = apiError.message;
        detail.errorCode = apiError.messageCode;
      },
    });
  }
}