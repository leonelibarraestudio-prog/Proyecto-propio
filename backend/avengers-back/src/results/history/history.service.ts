import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { FinalHistoryApi } from '../../basic/model/game-api/final-contract.model';

@Injectable()
export class HistoryService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getHistory(): Promise<FinalHistoryApi> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    return this.game.history(teamId, language);
  }
}