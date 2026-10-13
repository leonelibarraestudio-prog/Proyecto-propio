import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamConfigService } from './team-config.service';

@ApiTags('team-config')
@Controller('my-team/configuration')
export class TeamConfigController {
  constructor(private readonly teamConfigService: TeamConfigService) {}

  @Get()
  async getConfiguration() {
    return this.teamConfigService.getConfiguration();
  }
}