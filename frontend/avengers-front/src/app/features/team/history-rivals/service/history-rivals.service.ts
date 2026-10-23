
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
    this.selectedAttemptId = null;

    this.getData<HistoryRivalsApi>('/my-team/history-rivals').subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status =
          data.items.length > 0 ? 'data' : 'empty';
      },
      error: (error: unknown) => {
        const apiError: ApiError = toApiError(error);
        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
        this.pageState.errorCode = apiError.messageCode;
      },
    });
  }

  selectJourney(attemptId: string): void {
    this.selectedAttemptId = attemptId;
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;

    this.getData<HistoryRivalsApi>(
      `/my-team/history-rivals?attemptId=${encodeURIComponent(attemptId)}`,
    ).subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status = 'data';
        this.pageState.error = null;
        this.pageState.errorCode = null;
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
