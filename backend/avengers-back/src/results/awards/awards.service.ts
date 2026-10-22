
import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';

@Injectable()
export class AwardsService {
  constructor(private readonly gameApi: GameApiService) {}

  async getAwards(teamId: string, attemptId: string) {
    const statistics = await this.gameApi.get<{
      attemptId: string;
      status: string;
      completionOutcome?: string;
      teamStatistics?: unknown;
      heroStatistics?: unknown;
      awards?: Array<{
        code: string;
        label: string;
        explanation: string;
        winner: unknown;
        winningFacts: unknown;
        reason: string;
      }>;
    }>(
      `/teams/${encodeURIComponent(teamId)}/journeys/${encodeURIComponent(attemptId)}/statistics`,
    );

    return statistics;
  }
}
