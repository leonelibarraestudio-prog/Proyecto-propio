import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { toApiError } from '../../../../core/models/api-error.interface';

import {
  JourneyRound,
  TeamJourneyDetailModel,
  TeamJourneyModel,
} from '../model/team-journey-api.interface';

@Injectable({ providedIn: 'root' })
export class TeamJourneyService extends BaseApiService {
  constructor(api: ApiService) {
    super(api);
  }

  status: 'loading' | 'ready' | 'error' = 'loading';

  errorCode: string | null = null;

  data: TeamJourneyModel | null = null;

  detailStatus: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

  detailErrorCode: string | null = null;

  detail: TeamJourneyDetailModel | null = null;

  selectedEncounterId: string | null = null;

  selectedRoundIndex = 0;

  private journeyRequest?: Subscription;
  private detailRequest?: Subscription;

  initialize(): void {

    // Cancel subscriptions
    this.journeyRequest?.unsubscribe();
    this.detailRequest?.unsubscribe();

    // Status reset
    this.status = 'loading';
    this.errorCode = null;
    this.data = null;
    this.detail = null;
    this.detailStatus = 'idle';
    this.detailErrorCode = null;
    this.selectedEncounterId = null;
    this.selectedRoundIndex = 0;

    // Sends the request to the backend.
    this.journeyRequest = this.getData<TeamJourneyModel>('/journey/team').subscribe({
      next: (receivedData) => {
        this.data = receivedData;
        this.status = 'ready';
      },
      // Handles errors received from the backend.
      error: (receivedError) => {
        this.errorCode = toApiError(receivedError).messageCode ?? null;
        this.status = 'error';
      },
    });
  }
}
