import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { toApiError } from '../../../../core/models/api-error.interface';
import { PageState } from '../../../../core/models/page-state.interface';
import { FinalPreparationApi } from '../model/final-preparation-api.interface';

export interface FinalPreparationViewModel extends PageState {
  data: FinalPreparationApi | null;
}

@Injectable({ providedIn: 'root' })
export class FinalPreparationService extends BaseApiService {
  private readonly pageState: FinalPreparationViewModel = {
    status: 'loading',
    error: null,
    data: null,
  };

  constructor(api: ApiService) {
    super(api);
  }

  initialize(): void {
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

  getViewModel(): FinalPreparationViewModel {
    return this.pageState;
  }
}