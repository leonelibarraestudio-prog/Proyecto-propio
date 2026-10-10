import { Injectable } from '@angular/core';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { LiveEventsApi } from '../model/live-events-api.interface';
import { LiveEventsViewModel } from '../model/live-events-view-model.interface';

@Injectable({ providedIn: 'root' })
export class LiveEventsService extends BaseApiService {
  private readonly pageState: LiveEventsViewModel = {
    status: 'loading',
    error: null,
    data: null,
  };

  constructor(api: ApiService) {
    super(api);
  }

  getViewModel(): LiveEventsViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.pageState.status = 'loading';
    this.pageState.error = null;

    this.getData<LiveEventsApi>('/final-stage/events').subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status = data.events.length ? 'data' : 'empty';
      },
      error: (error: unknown) => {
        const apiError: ApiError = toApiError(error);
        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
      },
    });
  }
}