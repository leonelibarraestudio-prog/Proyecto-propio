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

  private transitionTimer?: ReturnType<typeof setTimeout>;

  constructor(api: ApiService) {
    super(api);
  }

  initialize(): void {
    this.dispose();
    this.status = 'loading';
    this.errorCode = null;
    this.data = null;
    this.detail = null;
    this.detailStatus = 'idle';
    this.detailErrorCode = null;
    this.selectedEncounterId = null;
    this.selectedRoundIndex = 0;

    this.journeyRequest = this.getData<TeamJourneyModel>('/journey/team').subscribe({
      next: (receivedData) => {
        this.data = receivedData;
        const firstEncounter = receivedData.encounters[0];
        if (receivedData.attemptId && firstEncounter) {
          this.selectEncounter(firstEncounter.encounterId);
        }
        this.status = 'ready';
      },
      error: (receivedError) => {
        this.errorCode = toApiError(receivedError).messageCode ?? null;
        this.status = 'error';
      },
    });
  }

  selectEncounter(encounterId: string): void {
    if (
      this.selectedEncounterId === encounterId &&
      (this.detailStatus === 'ready' || this.detailStatus === 'loading')
    ) {
      return;
    }
    this.detailRequest?.unsubscribe();
    clearTimeout(this.transitionTimer);
    this.selectedEncounterId = encounterId;
    this.detailErrorCode = null;
    this.detailStatus = 'loading';

    // Retain the old detail during its short exit transition.
    const transitionStarted = Date.now();
    const hadDetail = this.detail !== null;
    const path = `/journey/team/encounters/${encodeURIComponent(encounterId)}`;
    this.detailRequest = this.getData<TeamJourneyDetailModel>(path).subscribe({
      next: (receivedDetail) => {
        const rounds = [...receivedDetail.rounds];
        if (receivedDetail.extraRound) {
          rounds.push(receivedDetail.extraRound);
        }
        for (const round of rounds) {
          round.events.sort((first, second) => first.sequence - second.sequence);
          for (const event of round.events) {
            event.narrative?.lines.sort(
              (first, second) => first.lineSequence - second.lineSequence,
            );
          }
        }
        const delay = hadDetail ? Math.max(0, 160 - (Date.now() - transitionStarted)) : 0;
        this.transitionTimer = setTimeout(() => {
          this.detail = receivedDetail;
          this.selectedRoundIndex = 0;
          this.detailStatus = 'ready';
        }, delay);
      },
      error: (receivedError) => {
        this.detailErrorCode = toApiError(receivedError).messageCode ?? null;
        this.detailStatus = 'error';
      },
    });
  }

  get availableRounds(): JourneyRound[] {
    if (!this.detail) {
      return [];
    }
    return this.detail.extraRound
      ? [...this.detail.rounds, this.detail.extraRound]
      : this.detail.rounds;
  }

  get selectedRound(): JourneyRound | null {
    if (!this.detail) {
      return null;
    }
    if (this.selectedRoundIndex < this.detail.rounds.length) {
      return this.detail.rounds[this.selectedRoundIndex] ?? null;
    }
    return this.selectedRoundIndex === this.detail.rounds.length ? this.detail.extraRound : null;
  }

  selectRound(index: number): void {
    if (this.detailStatus !== 'ready') {
      return;
    }
    if (index >= 0 && index < this.availableRounds.length) {
      this.selectedRoundIndex = index;
    }
  }

  dispose(): void {
    this.journeyRequest?.unsubscribe();
    this.detailRequest?.unsubscribe();
    clearTimeout(this.transitionTimer);
  }
}
