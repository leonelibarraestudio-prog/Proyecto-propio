
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { HistoryRivalsService } from './history-rivals.service';

@ApiTags('history-rivals')
@Controller('my-team/history-rivals')
export class HistoryRivalsController extends AbstractController {
  constructor(
    private readonly historyRivalsService: HistoryRivalsService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get the current team history and rivals.' })
  async getHistory(@Query('attemptId') attemptId?: string) {
    return this.createOkResponse(
      await this.historyRivalsService.getHistory(attemptId),
    );
  }
}
