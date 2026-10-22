import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiError, toApiError } from '../../../../core/models/api-error.interface';
import { ApiService } from '../../../../core/services/api.service';
import { AppContextService } from '../../../../core/services/app-context.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { LiveEventsApi } from '../model/live-events-api.interface';
import { LiveEventsViewModel } from '../model/live-events-view-model.interface';

const NO_JOURNEY_MESSAGE_CODE = 'JOURNEY_REQUIRED';

@Injectable({ providedIn: 'root' })
export class LiveEventsService extends BaseApiService {
  private readonly pageState: LiveEventsViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
    lang: 'en',
    refreshing: false,
  };

  constructor(
    api: ApiService,
    private readonly appContextService: AppContextService,
  ) {
    super(api);
  }

  getViewModel(): LiveEventsViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.pageState.lang = this.appContextService.getCurrentLang();
    this.pageState.status = 'loading';
    this.loadEvents();
  }

  refresh(): void {
    if (this.pageState.refreshing) {
      return;
    }
    this.loadEvents();
  }

  private loadEvents(): void {
    this.pageState.refreshing = true;
    this.pageState.error = null;
    this.pageState.errorCode = null;

    this.getData<LiveEventsApi>('/final-stage/events')
      .pipe(
        finalize(() => {
          this.pageState.refreshing = false;
        }),
      )
      .subscribe({
        next: (data) => {
          this.pageState.data = data;
          this.pageState.status = data.events.length ? 'data' : 'empty';
        },
        error: (error: unknown) => {
          const apiError: ApiError = toApiError(error);
          this.pageState.data = null;
          this.pageState.error = apiError.message;
          this.pageState.errorCode = apiError.messageCode;
          this.pageState.status =
            apiError.messageCode === NO_JOURNEY_MESSAGE_CODE ? 'unavailable' : 'error';
        },
      });
  }
}
