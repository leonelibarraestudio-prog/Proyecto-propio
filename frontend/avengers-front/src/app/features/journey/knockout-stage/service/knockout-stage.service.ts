import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { KnockoutStageApi } from '../model/knockout-stage-api.interface';

@Injectable({ providedIn: 'root' })
export class KnockoutStageService extends BaseApiService {
  private data: KnockoutStageApi | null = null;
  private loadError = false;

  constructor(api: ApiService) {
    super(api);
  }

  getKnockoutStage(): KnockoutStageApi | null {
    return this.data;
  }

  hasLoadError(): boolean {
    return this.loadError;
  }

  initialize(): void {
    this.loadKnockoutStage();
  }

  private loadKnockoutStage(): void {
    this.loadError = false;

    this.getData<KnockoutStageApi>('/journey/knockout-stage').subscribe({
      next: (data) => {
        this.data = data;
      },
      error: () => {
        this.loadError = true;
      },
    });
  }
}