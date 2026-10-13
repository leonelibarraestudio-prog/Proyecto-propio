import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { EtapasDelJourneyApi } from '../../basic/model/game-api/etapas-del-journey-api.model';
import { ResponseObject } from '../../basic/response-object.interface';
import { GroupStageService } from './group-stage.service';

@ApiTags('group-stage')
@Controller('journey/group-stage')
export class GroupStageController extends AbstractController {
  constructor(private readonly groupstageService: GroupStageService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Ver los grupos del journey actual.' })
  async obtenerEtapasActuales(): Promise<ResponseObject<EtapasDelJourneyApi>> {
    return this.createOkResponse(
      await this.groupstageService.obtenerEtapasActuales(),
    );
  }
}
