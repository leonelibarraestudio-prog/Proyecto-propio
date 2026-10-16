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

    // Sends the journey request to the backend.
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

  selectEncounter(encounterId: string): void {
    // Cancels the previous encounter request.
    this.detailRequest?.unsubscribe();

    // Resets the encounter detail.
    this.selectedEncounterId = encounterId;
    this.selectedRoundIndex = 0;
    this.detail = null;
    this.detailErrorCode = null;
    this.detailStatus = 'loading';

    // Sends the encounter detail request to the backend.
    const path = `/journey/team/encounters/${encodeURIComponent(encounterId)}`;

    this.detailRequest = this.getData<TeamJourneyDetailModel>(path).subscribe({
      next: (receivedDetail) => {
        this.detail = receivedDetail;
        this.detailStatus = 'ready';
      },
      // Handles errors received from the backend.
      error: (receivedError) => {
        this.detailErrorCode = toApiError(receivedError).messageCode ?? null;
        this.detailStatus = 'error';
      },
    });
  }

  // Returns all available rounds, including the extra round if it exists.
  get availableRounds(): JourneyRound[] {
    if (!this.detail) {
      return [];
    }

    if (this.detail.extraRound) {
      return [...this.detail.rounds, this.detail.extraRound];
    }

    return this.detail.rounds;
  }

  // Returns the currently selected round.
  get selectedRound(): JourneyRound | null {
    return this.availableRounds[this.selectedRoundIndex] ?? null;
  }

  // Changes the selected round if the index is valid.
  selectRound(index: number): void {
    if (index >= 0 && index < this.availableRounds.length) {
      this.selectedRoundIndex = index;
    }
  }

  // Cancels active subscriptions.
  dispose(): void {
    this.journeyRequest?.unsubscribe();
    this.detailRequest?.unsubscribe();
  }
}
