import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { FinalHistoryApi } from '../../basic/model/game-api/final-contract.model';
import { HistoryService } from './history.service';

@ApiTags('history')
@Controller('results/history')
export class HistoryController extends AbstractController {
  constructor(private readonly historyService: HistoryService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get the battle history of the assigned Team.' })
  async getHistory(): Promise<ResponseObject<FinalHistoryApi>> {
    return this.createOkResponse(await this.historyService.getHistory());
  }
}