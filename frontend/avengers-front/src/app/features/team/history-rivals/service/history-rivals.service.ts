
import { Injectable } from '@angular/core';
import {
  ApiError,
  toApiError,
} from '../../../../core/models/api-error.interface';
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

export interface HistoryRivalsHero {
  id: string;
  name: string;
  rivals: string[];
  rivalNames?: Record<string, string>;
}

export interface HistoryRivalsRelationship {
  heroAId: string;
  heroBId: string;
  relationship: string;
}

export interface HistoryRivalsTeam {
  teamId: string;
  name: string;
  leaderId: string;
  heroIds: string[];
}

export interface HistoryRivalsEncounter {
  encounterId: string;
  stageId: string;
  stageCode: string;
  groupId: string | null;
  teamAId: string;
  teamBId: string;
  winnerTeamId: string | null;
  resolutionCode: string;
  rivalEncounter: boolean;
  results: Array<{
    teamId: string;
    resultCode: string;
  }>;
  damageByTeam: Array<{
    teamId: string;
    damageDealt: number;
  }>;
}

export interface HistoryRivalsApi {
  teamId: string;
  language: string;
  items: HistoryRivalsItem[];
  heroes: HistoryRivalsHero[];
  relationships: HistoryRivalsRelationship[];
  teams: HistoryRivalsTeam[];
  encounters: HistoryRivalsEncounter[];
}

export interface HistoryRivalsViewModel {
  status: 'loading' | 'data' | 'empty' | 'error';
  error: string | null;
  errorCode: string | null;
  data: HistoryRivalsApi | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryRivalsService extends BaseApiService {
  selectedAttemptId: string | null = null;

  private requestVersion = 0;

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

  private clearEncounterResults(): void {
    if (!this.pageState.data) {
      return;
    }

    this.pageState.data = {
      ...this.pageState.data,
      teams: [],
      encounters: [],
    };
  }

  private updateStatus(data: HistoryRivalsApi): void {
    const hasData =
      (data.items?.length ?? 0) > 0 ||
      (data.heroes?.length ?? 0) > 0 ||
      (data.relationships?.length ?? 0) > 0 ||
      (data.teams?.length ?? 0) > 0 ||
      (data.encounters?.length ?? 0) > 0;

    this.pageState.status = hasData ? 'data' : 'empty';
  }

  initialize(): void {
    const requestVersion = ++this.requestVersion;

    this.selectedAttemptId = null;
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;
    this.clearEncounterResults();

    this.getData<HistoryRivalsApi>(
      '/my-team/history-rivals',
    ).subscribe({
      next: (data) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.pageState.data = data;
        this.pageState.error = null;
        this.pageState.errorCode = null;
        this.updateStatus(data);
      },
      error: (error: unknown) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        const apiError: ApiError = toApiError(error);

        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
        this.pageState.errorCode = apiError.messageCode;
      },
    });
  }

  selectJourney(attemptId: string): void {
    const requestVersion = ++this.requestVersion;

    this.selectedAttemptId = attemptId;
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;
    this.clearEncounterResults();

    this.getData<HistoryRivalsApi>(
      `/my-team/history-rivals?attemptId=${encodeURIComponent(attemptId)}`,
    ).subscribe({
      next: (data) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.pageState.data = data;
        this.pageState.error = null;
        this.pageState.errorCode = null;
        this.updateStatus(data);
      },
      error: (error: unknown) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        const apiError: ApiError = toApiError(error);

        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
        this.pageState.errorCode = apiError.messageCode;
      },
    });
  }
}
