import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { HistoryDetailModel, HistoryModel, HistoryService } from './history.service';

@ApiTags('history')
@Controller('results/history')
export class HistoryController extends AbstractController {
  constructor(private readonly historyService: HistoryService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get the completed Journeys of the assigned Team.' })
  async getHistory(): Promise<ResponseObject<HistoryModel>> {
    return this.createOkResponse(await this.historyService.getHistory());
  }

  @Get(':attemptId')
  @ApiOperation({ summary: 'Get the read-only detail of one completed Journey.' })
  @ApiParam({
    name: 'attemptId',
    description: 'Identifier of the historical Journey, taken from the history list.',
  })
  async getHistoryDetail(
    @Param('attemptId') attemptId: string,
  ): Promise<ResponseObject<HistoryDetailModel>> {
    return this.createOkResponse(await this.historyService.getHistoryDetail(attemptId));
  }
}