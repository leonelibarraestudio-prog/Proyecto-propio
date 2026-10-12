import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';

@Injectable()
export class TeamConfigService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getConfiguration() {
    const teamId = this.context.getCurrentTeamId();
    // Llama a la configuracuion de la Game API
    return await this.game.configuration(teamId);
  }
}