import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { HistoryModel, HistoryService } from './history.service';

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
}