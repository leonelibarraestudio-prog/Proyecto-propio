import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamStatusService } from './team-status.service';
import { AbstractController } from '../../basic/abstract.controller';

@ApiTags('team-status')
@Controller('final-stage/status')
export class TeamStatusController extends AbstractController {
  constructor(private readonly teamstatusService: TeamStatusService) {
    super();
  }

@Get()
async getTeamStatus() {
  return this.createOkResponse(await this.teamstatusService.getTeamStatus())
};
}
