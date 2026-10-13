
import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';

@Injectable()
export class AwardsService {
  constructor(private readonly gameApi: GameApiService) {}

  async getAwards(teamId: string, attemptId: string) {
    const [statistics, rewards] = await Promise.all([
      this.gameApi.get(
        `/teams/${teamId}/journeys/${attemptId}/statistics`,
      ),
      this.gameApi.get(
        `/teams/${teamId}/journeys/${attemptId}/rewards`,
      ),
    ]);

    return {
      statistics,
      rewards,
    };
  }
}