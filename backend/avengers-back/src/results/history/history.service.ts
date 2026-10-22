import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { FinalHistoryItemApi } from '../../basic/model/game-api/final-contract.model';

export interface HistorySummary {
  total: number;
  victories: number;
  defeats: number;
  abandoned: number;
}

export interface HistoryModel {
  teamId: string;
  language: string;
  summary: HistorySummary;
  items: FinalHistoryItemApi[];
}

@Injectable()
export class HistoryService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getHistory(): Promise<HistoryModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    const history = await this.game.history(teamId, language);

    const items = [...history.items].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    return {
      teamId: history.teamId,
      language: history.language,
      summary: {
        total: items.length,
        victories: items.filter((item) => item.outcomeCode === 'VICTORY').length,
        defeats: items.filter((item) => item.outcomeCode === 'DEFEAT').length,
        abandoned: items.filter((item) => item.outcomeCode === 'ABANDON').length,
      },
      items,
    };
  }
}