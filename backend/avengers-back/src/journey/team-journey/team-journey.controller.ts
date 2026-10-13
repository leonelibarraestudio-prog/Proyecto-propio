import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeamJourneyService } from './team-journey.service';
import { AbstractController } from 'src/basic/abstract.controller';
import { TeamJourneyModel } from './model/team-journey.model';
import { ResponseObject } from 'src/basic/response-object.interface';

@ApiTags('Team Journey')
@Controller('journey/team')
export class TeamJourneyController extends AbstractController {
  constructor(private readonly teamJourneyService: TeamJourneyService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Read the current player-team Journey.' })
  async getJourney(): Promise<ResponseObject<TeamJourneyModel>> {
    const journey = await this.teamJourneyService.getJourney();
    return this.createOkResponse(journey);
  }
}
