import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { toApiError } from '../../../../core/models/api-error.interface';
import { PageState } from '../../../../core/models/page-state.interface';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { FinalPreparationApi } from '../model/final-preparation-api.interface';

export interface FinalPreparationViewModel extends PageState {
  data: FinalPreparationApi | null;
  submitting: boolean;
}

@Injectable({ providedIn: 'root' })
export class FinalPreparationService extends BaseApiService {
  private readonly pageState: FinalPreparationViewModel = {
    status: 'loading',
    error: null,
    errorCode: null,
    data: null,
    submitting: false,
  };

  constructor(api: ApiService) {
    super(api);
  }

  getViewModel(): FinalPreparationViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.pageState.status = 'loading';
    this.pageState.error = null;
    this.pageState.errorCode = null;
    this.getData<FinalPreparationApi>('/final-stage/preparation').subscribe({
      next: (data) => this.showData(data),
      error: (error: unknown) => {
        const apiError = toApiError(error);
        this.pageState.status = 'error';
        this.pageState.error = apiError.message;
        this.pageState.errorCode = apiError.messageCode;
      },
    });
  }

  purchase(itemId: string, onDone?: () => void): void {
    this.submit(
      this.postData<FinalPreparationApi>('/final-stage/preparation/purchases', {
        itemId,
        quantity: 1,
      }),
      onDone,
    );
  }

  useItem(itemId: string, targetHeroId?: string, onDone?: () => void): void {
    this.submit(
      this.postData<FinalPreparationApi>(
        '/final-stage/preparation/items',
        targetHeroId ? { itemId, targetHeroId } : { itemId },
      ),
      onDone,
    );
  }

  savePreparation(activeHeroIds: string[], strategy: string, onDone?: () => void): void {
    this.submit(
      this.putData<FinalPreparationApi>('/final-stage/preparation', { activeHeroIds, strategy }),
      onDone,
    );
  }

  // Runs one operation that changes data. The backend answers with the refreshed state.
  private submit(request$: Observable<FinalPreparationApi>, onDone?: () => void): void {
    if (this.pageState.submitting) {
      return;
    }
    this.pageState.submitting = true;
    this.pageState.error = null;
    this.pageState.errorCode = null;
    request$
      .pipe(
        finalize(() => {
          this.pageState.submitting = false;
        }),
      )
      .subscribe({
        next: (data) => {
          this.showData(data);
          onDone?.();
        },
        error: (error: unknown) => {
          const apiError = toApiError(error);
          this.pageState.error = apiError.message;
          this.pageState.errorCode = apiError.messageCode;
        },
      });
  }

  private showData(data: FinalPreparationApi): void {
    this.pageState.data = data;
    this.pageState.status = data.available ? 'data' : 'empty';
  }
}
