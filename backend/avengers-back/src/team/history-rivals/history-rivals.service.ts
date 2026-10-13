
import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';

@Injectable()
export class HistoryRivalsService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getHistory() {
    const teamId = this.context.getCurrentTeamId();
    const lang = this.context.language;

    return this.game.history(teamId, lang);
  }
}
