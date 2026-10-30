import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { KnockoutStageApi } from '../model/knockout-stage-api.interface';
import { TeamJourneyModel } from '../../team-journey/model/team-journey-api.interface';

@Injectable({ providedIn: 'root' })
export class KnockoutStageService extends BaseApiService {
  private data: KnockoutStageApi | null = null;
  private journeyData: TeamJourneyModel | null = null;
  private loadError = false;

  constructor(api: ApiService) {
    super(api);
  }

  getKnockoutStage(): KnockoutStageApi | null {
    return this.data;
  }

  getTeamJourney(): TeamJourneyModel | null {
    return this.journeyData;
  }

  hasLoadError(): boolean {
    return this.loadError;
  }

  initialize(): void {
    this.data = null;
    this.journeyData = null;
    this.loadError = false;
    this.getData<KnockoutStageApi>('/journey/knockout-stage').subscribe({
      next: (data) => {
        this.data = data;
      },
      error: () => {
        this.loadError = true;
      },
    });
    this.getData<TeamJourneyModel>('/journey/team').subscribe({
      next: (data) => {
        this.journeyData = data;
      },
      error: () => {
        this.journeyData = null;
      },
    });
  }
}