import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { LiveEventsModel } from './model/live-events.model';
import { LiveEventsService } from './live-events.service';

@ApiTags('live-events')
@Controller('final-stage/events')
export class LiveEventsController extends AbstractController {
  constructor(private readonly liveEventsService: LiveEventsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get the status and published events of the current Final.' })
  async getEvents(): Promise<ResponseObject<LiveEventsModel>> {
    return this.createOkResponse(await this.liveEventsService.getEvents());
  }
}