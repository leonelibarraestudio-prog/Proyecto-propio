import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { toApiError } from '../../../../core/models/api-error.interface';
import { TeamJourneyModel } from '../model/team-journey-api.interface';

@Injectable({ providedIn: 'root' })
export class TeamJourneyService extends BaseApiService {
  constructor(api: ApiService) {
    super(api);
  }

  status: 'loading' | 'ready' | 'error' = 'loading';

  errorCode: string | null = null;

  data: TeamJourneyModel | null = null;

  initialize(): void {
    // Status reset
    this.status = 'loading';
    this.errorCode = null;
    this.data = null;
    // Sends the request to the backend.
    this.getData<TeamJourneyModel>('/journey/team').subscribe({
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
