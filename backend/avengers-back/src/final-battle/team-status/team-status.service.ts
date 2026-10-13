import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameApiService } from '../../basic/game-api.service';
import { FinalStageStateApi } from './model/team-status-api.model';


@Injectable()
export class TeamStatusService {
  constructor (
    private readonly context: ApplicationContextService,
    private readonly gameApi: GameApiService,
){}
  getTeamStatus() {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    return this.gameApi.get<FinalStageStateApi>(
      `/teams/${teamId}/journeys/current/final-stage`,
      {lang: language},
    );
}
}
