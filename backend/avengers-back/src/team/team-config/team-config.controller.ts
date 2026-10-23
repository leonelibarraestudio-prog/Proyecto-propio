import { Controller, Get, Put, Body } from '@nestjs/common';
import { TeamConfigService } from './team-config.service';
import { UpdateTeamConfigDto } from './model/team-config.model';

@Controller('my-team/configuration')
export class TeamConfigController {
  constructor(private readonly teamConfigService: TeamConfigService) {}

  @Get()
  async getConfiguration() {
    return await this.teamConfigService.getConfiguration();
  }

  @Put()
  async updateConfiguration(@Body() dto: UpdateTeamConfigDto) {
    return await this.teamConfigService.updateConfiguration(dto);
  }
}