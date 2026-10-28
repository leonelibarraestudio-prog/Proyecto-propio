import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { AwardsService, AwardsStatistics } from './awards.service';

@ApiTags('awards')
@Controller('results/awards')
export class AwardsController extends AbstractController {
  constructor(private readonly awardsService: AwardsService) {
    super();
  }

  @Get(':teamId/:attemptId')
  @ApiOperation({ summary: 'Get official statistics and Awards for a completed Journey.' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  async getAwards(
    @Param('teamId') teamId: string,
    @Param('attemptId') attemptId: string,
    @Query('lang') lang = 'es',
  ): Promise<ResponseObject<AwardsStatistics>> {
    const result = await this.awardsService.getAwards(teamId, attemptId, lang);
    return this.createOkResponse(result);
  }
}
