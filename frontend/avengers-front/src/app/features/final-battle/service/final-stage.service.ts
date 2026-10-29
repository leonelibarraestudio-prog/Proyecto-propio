import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { BaseApiService } from '../../../core/services/base-api.service';
import {
  BattleCommand,
  BattleReceipt,
  FinalBattleModel,
} from '../final-battle/model/final-battle-api.interface';
import { LiveEventsApi } from '../live-events/model/live-events-api.interface';

// Shared HTTP service for R9 and R10.
@Injectable({ providedIn: 'root' })
export class FinalStageService extends BaseApiService {
  constructor(api: ApiService) {
    super(api);
  }

  // Get the current battle data for R9.
  getBattle() {
    return this.getData<FinalBattleModel>('/final-stage');
  }

  // Get battle events for R10.
  getEvents() {
    return this.getData<LiveEventsApi>('/final-stage/events');
  }

  // Send a battle command and return the result for R9.
  play(command: BattleCommand) {
    return this.postData<BattleReceipt>('/final-stage/play', command);
  }
}
