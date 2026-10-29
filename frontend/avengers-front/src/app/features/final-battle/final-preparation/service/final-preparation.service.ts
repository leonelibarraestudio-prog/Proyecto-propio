import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { toApiError } from '../../../../core/models/api-error.interface';
import { PageState } from '../../../../core/models/page-state.interface';
import { FinalPreparationApi } from '../model/final-preparation-api.interface';
import { finalize } from 'rxjs';

export interface FinalPreparationViewModel extends PageState {
  data: FinalPreparationApi | null;
  submitting: boolean;
}

@Injectable({ providedIn: 'root' })
export class FinalPreparationService extends BaseApiService {
  private readonly pageState: FinalPreparationViewModel = {
    status: 'loading',
    error: null,
    data: null,
    submitting: false,
  };

  constructor(api: ApiService) {
    super(api);
  }

  initialize(): void {
    this.pageState.error = null;
    this.pageState.status = 'loading';
    this.getData<FinalPreparationApi>('/final-stage/preparation').subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status = 'data';
      },
      error: (error) => {
        const apiError = toApiError(error);
        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
      },
    });
  }
  
  purchase(itemId: string): void {
  this.submit('/final-stage/preparation/purchases', { itemId, quantity: 1 });
}

useItem(itemId: string, targetHeroId?: string): void {
  this.submit(
    '/final-stage/preparation/items',
    targetHeroId ? { itemId, targetHeroId } : { itemId },
  );
}

private submit(path: string, body: object): void {
  if (this.pageState.submitting) {
    return;
  }
  this.pageState.submitting = true;
  this.pageState.error = null;
  this.postData<FinalPreparationApi>(path, body)
    .pipe(
      finalize(() => {
        this.pageState.submitting = false;
      }),
    )
    .subscribe({
      next: (data) => {
        this.pageState.data = data;
        this.pageState.status = 'data';
      },
      error: (error) => {
        this.pageState.error = toApiError(error).message;
      },
    });
}

  getViewModel(): FinalPreparationViewModel {
    return this.pageState;
  }
}