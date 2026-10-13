
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AwardsService } from './awards.service';

@ApiTags('awards')
@Controller('results/awards')
export class AwardsController {
  constructor(
    private readonly awardsService: AwardsService,
  ) {}

  @Get(':teamId/:attemptId')
  getAwards(
    @Param('teamId') teamId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.awardsService.getAwards(teamId, attemptId);
  }
}